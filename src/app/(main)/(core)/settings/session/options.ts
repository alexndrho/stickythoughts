import { queryOptions } from "@tanstack/react-query";

import { authClient } from "@/lib/auth-client";
import { userOptions } from "../../user/options";

export const userSessionsOptions = queryOptions({
  queryKey: [...userOptions.queryKey, "sessions"],
  queryFn: async () => authClient.listSessions(),
});
