import { queryOptions } from "@tanstack/react-query";

import { userOptions } from "../user/options";
import { getUserAccountSettings } from "@/services/user";

export const userAccountOptions = queryOptions({
  queryKey: [...userOptions.queryKey, "account"],
  queryFn: getUserAccountSettings,
});
