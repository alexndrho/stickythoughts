import { queryOptions } from "@tanstack/react-query";

import { userOptions } from "../../user/options";
import { getUserSettingsPrivacy } from "@/services/user";

export const userSettingsPrivacy = queryOptions({
  queryKey: [...userOptions.queryKey, "privacy"],
  queryFn: getUserSettingsPrivacy,
});
