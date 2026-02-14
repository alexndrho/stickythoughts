import "server-only";

import { after } from "next/server";
import { betterAuth } from "better-auth";
import {
  APIError,
  createAuthMiddleware,
  getSessionFromCtx,
} from "better-auth/api";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import {
  admin as adminPlugin,
  captcha,
  emailOTP,
  twoFactor,
  username,
} from "better-auth/plugins";
import { render } from "@react-email/components";
import { generateUsername } from "unique-username-generator";

import { prisma } from "./db";
import { getRedisClient } from "./redis";
import { ac, admin, moderator } from "./permissions";
import { resend } from "./email";
import EmailOTPTemplate from "@/components/emails/email-otp-template";
import EmailLinkTemplate from "@/components/emails/email-link-template";
import reservedUsernames from "@/config/reserved-usernames.json";
import { USERNAME_REGEX } from "@/config/text";
import { matcher } from "./bad-words";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      const emailHtml = await render(
        EmailLinkTemplate({ url, type: "email-verification" }),
      );

      after(
        resend.emails.send({
          from: "StickyThoughts <no-reply@mail.stickythoughts.app>",
          to: user.email,
          subject: "Verify your email address",
          html: emailHtml,
        }),
      );
    },
  },
  user: {
    changeEmail: {
      enabled: true,
      sendChangeEmailVerification: async ({ user, url }) => {
        const emailHtml = await render(
          EmailLinkTemplate({ url, type: "email-change" }),
        );

        after(
          resend.emails.send({
            from: "StickyThoughts <no-reply@mail.stickythoughts.app>",
            to: user.email,
            subject: "Approve your email change",
            html: emailHtml,
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
              generatedUsername = generateUsername("", 4);

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
        moderator,
      },
    }),
    twoFactor(),
    username({
      usernameValidator: (username) => {
        if (!USERNAME_REGEX.test(username)) {
          throw new APIError("BAD_REQUEST", {
            code: "INVALID_USERNAME",
            message:
              "Username can only contain letters, numbers, and single hyphens no leading, trailing, or consecutive hyphens.",
          });
        } else if (
          matcher.hasMatch(username) ||
          reservedUsernames.reserved_usernames.includes(username.toLowerCase())
        ) {
          throw new APIError("BAD_REQUEST", {
            message: "This username is not allowed.",
          });
        }

        return true;
      },
      displayUsernameValidator: (displayUsername) => {
        if (matcher.hasMatch(displayUsername)) {
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
        "/sign-in/username",
        "/email-otp/send-verification-otp",
      ],
    }),
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        const emailHtml = await render(EmailOTPTemplate({ otp, type }));

        after(
          resend.emails.send({
            from: "StickyThoughts <no-reply@mail.stickythoughts.app>",
            to: email,
            subject: `${otp} is your StickyThoughts verification code`,
            html: emailHtml,
          }),
        );
      },
    }),
  ],
  hooks: {
    // current better-auth version doesn't support targeting specific roles
    // only admin can ban everyone, moderator can only ban user or null role
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== "/admin/ban-user" && ctx.path !== "/admin/unban-user") {
        return;
      }

      const session = await getSessionFromCtx(ctx);
      if (!session || session.user.role === "admin") {
        return;
      }

      const targetUserId =
        typeof ctx.body === "object" && ctx.body ? ctx.body.userId : undefined;

      if (!targetUserId || typeof targetUserId !== "string") {
        return;
      }

      const targetUser = await prisma.user.findUnique({
        where: { id: targetUserId },
        select: { role: true },
      });

      if (!targetUser) {
        throw new APIError("NOT_FOUND", { message: "User not found" });
      }

      if (targetUser.role !== "user" && targetUser.role !== null) {
        throw new APIError("FORBIDDEN", {
          message: "You are not allowed to ban this user.",
        });
      }
    }),
  },
});
