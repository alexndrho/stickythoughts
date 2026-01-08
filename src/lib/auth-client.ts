import { createAuthClient } from "better-auth/react";
import {
  adminClient,
  anonymousClient,
  emailOTPClient,
  twoFactorClient,
  usernameClient,
} from "better-auth/client/plugins";

import { ac, admin } from "./permissions";

export const authClient = createAuthClient({
  plugins: [
    anonymousClient(),
    usernameClient(),
    adminClient({
      ac,
      roles: {
        admin,
      },
    }),
    emailOTPClient(),
    twoFactorClient(),
  ],
});
