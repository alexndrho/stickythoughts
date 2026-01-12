import { headers } from "next/headers";
import { after } from "next/server";
import { betterAuth } from "better-auth";
import { APIError } from "better-auth/api";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import {
  admin as adminPlugin,
  anonymous,
  captcha,
  emailOTP,
  twoFactor,
  username,
} from "better-auth/plugins";
import { generateUsername } from "unique-username-generator";

import { prisma } from "./db";
import { getRedisClient } from "./redis";
import { ac, admin } from "./permissions";
import { resend } from "./email";
import { removeProfilePicture } from "@/services/user";
import EmailOTPTemplate from "@/components/emails/EmailOTPTemplate";
import EmailLinkTemplate from "@/components/emails/EmailLinkTemplate";
import { profanity } from "./profanity";
import reservedUsernames from "@/config/reserved-usernames.json";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      after(
        resend.emails.send({
          from: "StickyThoughts <no-reply@mail.alexanderho.dev>",
          to: user.email,
          subject: "Verify your email address",
          react: EmailLinkTemplate({ url, type: "email-verification" }),
        }),
      );
    },
  },
  user: {
    changeEmail: {
      enabled: true,
      sendChangeEmailVerification: async ({ user, url }) => {
        after(
          resend.emails.send({
            from: "StickyThoughts <no-reply@mail.alexanderho.dev>",
            to: user.email,
            subject: "Approve your email change",
            react: EmailLinkTemplate({ url, type: "email-change" }),
          }),
        );
      },
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  secondaryStorage: {
    get: async (key) => {
      return await getRedisClient().get(key);
    },
    set: async (key, value, ttl) => {
      if (ttl) {
        await getRedisClient().set(key, value, "EX", ttl);
      } else {
        await getRedisClient().set(key, value);
      }
    },
    delete: async (key) => {
      await getRedisClient().del(key);
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user, ctx) => {
          const username =
            (user as unknown as { username: string }).username || "";

          if (!username) {
            const maxAttempts = 10;
            let generatedUsername = "";
            let existingUser = null;

            for (let attempt = 0; attempt < maxAttempts; attempt++) {
              const randomDigits = Math.floor(1000 + Math.random() * 9000);
              generatedUsername = `${generateUsername()}${randomDigits}`;

              existingUser = await ctx?.context.adapter.findOne({
                model: "user",
                where: [
                  {
                    field: "username",
                    value: generatedUsername.toLowerCase(),
                  },
                ],
              });

              if (!existingUser) {
                break;
              }
            }

            if (existingUser) {
              throw new APIError("INTERNAL_SERVER_ERROR", {
                message:
                  "Failed to generate a unique username. Please try again.",
              });
            }

            user = { ...user, username: generatedUsername.toLowerCase() };
          }

          return { data: user };
        },
      },
    },
  },
  plugins: [
    nextCookies(),
    adminPlugin({
      ac,
      roles: {
        admin,
      },
    }),
    twoFactor(),
    username({
      usernameValidator: (username) => {
        if (
          profanity.exists(username) ||
          reservedUsernames.reserved_usernames.includes(username.toLowerCase())
        ) {
          throw new APIError("BAD_REQUEST", {
            message: "This username is not allowed.",
          });
        }

        return true;
      },
      displayUsernameValidator: (displayUsername) => {
        if (profanity.exists(displayUsername)) {
          throw new APIError("BAD_REQUEST", {
            message: "This display name is not allowed.",
          });
        }

        return true;
      },
    }),
    captcha({
      provider: "cloudflare-turnstile",
      secretKey: process.env.CLOUDFLARE_TURNSTILE_SECRET_AUTH_KEY!,
      endpoints: [
        "/sign-up/email",
        "/sign-in/email",
        "/sign-in/anonymous",
        "/sign-in/username",
        // "/forget-password", // Disabled because it doesn't work
      ],
    }),
    anonymous({
      onLinkAccount: async ({ anonymousUser, newUser }) => {
        try {
          const oldUserId = anonymousUser.user.id;
          const newUserId = newUser.user.id;

          if (anonymousUser.user.image) {
            const headerList = await headers();
            const cookie = headerList.get("cookie");

            await removeProfilePicture({ cookie: cookie ?? undefined });
          }

          await prisma.$transaction([
            prisma.thread.updateMany({
              where: { authorId: oldUserId },
              data: { authorId: newUserId },
            }),
            prisma.threadLike.updateMany({
              where: { userId: oldUserId },
              data: { userId: newUserId },
            }),
            prisma.threadComment.updateMany({
              where: { authorId: oldUserId },
              data: { authorId: newUserId },
            }),
            prisma.threadCommentLike.updateMany({
              where: { userId: oldUserId },
              data: { userId: newUserId },
            }),
            prisma.notification.updateMany({
              where: { userId: oldUserId },
              data: { userId: newUserId },
            }),
            prisma.notificationActor.updateMany({
              where: { userId: oldUserId },
              data: { userId: newUserId },
            }),
          ]);
        } catch (error) {
          console.error("Error linking anonymous account:", error);

          throw new APIError("INTERNAL_SERVER_ERROR", {
            message: "Failed to link anonymous account. Please try again.",
          });
        }
      },
    }),
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        after(
          resend.emails.send({
            from: "StickyThoughts <no-reply@mail.alexanderho.dev>",
            to: email,
            subject: `${otp} is your StickyThoughts verification code`,
            react: EmailOTPTemplate({ otp, type }),
          }),
        );
      },
    }),
  ],
});
