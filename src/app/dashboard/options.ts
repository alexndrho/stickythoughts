import { queryOptions } from "@tanstack/react-query";

import { authClient } from "@/lib/auth-client";
import { ADMIN_USERS_PER_PAGE } from "@/config/admin";

export const adminOptions = queryOptions({
  queryKey: ["admin"],
});

export const adminUsersOptions = queryOptions({
  queryKey: [...adminOptions.queryKey, "users"],
});

export const adminUsersPageOptions = (page: number) => {
  return queryOptions({
    queryKey: [...adminOptions.queryKey, "users", page],
    queryFn: () =>
      authClient.admin.listUsers({
        query: {
          limit: ADMIN_USERS_PER_PAGE,
          offset: (page - 1) * ADMIN_USERS_PER_PAGE,
        },
      }),
  });
};
