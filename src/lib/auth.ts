import { betterAuth } from "better-auth";
import { APIError } from "better-auth/api";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import {
  admin as adminPlugin,
  captcha,
  emailOTP,
  twoFactor,
  username,
} from "better-auth/plugins";
import { generateUsername } from "unique-username-generator";

import { prisma } from "./db";
import { ac, admin } from "./permissions";
import { resend } from "./email";
import EmailOTPTemplate from "@/components/emails/EmailOTPTemplate";
import EmailLinkTemplate from "@/components/emails/EmailLinkTemplate";
import { profanity } from "./profanity";
import reservedUsernames from "@/config/reserved-usernames.json";
import { after } from "next/server";

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
              generatedUsername = generateUsername();
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
