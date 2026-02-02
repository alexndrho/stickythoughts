import { createAuthClient } from "better-auth/react";
import {
  adminClient,
  anonymousClient,
  emailOTPClient,
  twoFactorClient,
  usernameClient,
} from "better-auth/client/plugins";

import { ac, admin, moderator } from "./permissions";

export const authClient = createAuthClient({
  plugins: [
    anonymousClient(),
    usernameClient(),
    adminClient({
      ac,
      roles: {
        admin,
        moderator,
      },
    }),
    emailOTPClient(),
    twoFactorClient(),
  ],
});
