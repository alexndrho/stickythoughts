import { createAuthClient } from "better-auth/react";
import {
  emailOTPClient,
  twoFactorClient,
  usernameClient,
} from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [usernameClient(), emailOTPClient(), twoFactorClient()],
});
