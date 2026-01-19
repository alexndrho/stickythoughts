import { queryOptions } from "@tanstack/react-query";

import { authClient } from "@/lib/auth-client";
import { userOptions } from "../user/options";
import { getUserAccountSettings } from "@/services/user";

export const userAccountOptions = queryOptions({
  queryKey: [...userOptions.queryKey, "account"],
  queryFn: getUserAccountSettings,
});

export const userAccountListOptions = queryOptions({
  queryKey: [...userOptions.queryKey, "account-list"],
  queryFn: () => authClient.listAccounts(),
});
