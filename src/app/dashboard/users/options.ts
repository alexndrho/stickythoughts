import "client-only";

import { queryOptions } from "@tanstack/react-query";

import { authClient } from "@/lib/auth-client";
import { ADMIN_USERS_PER_PAGE } from "@/config/admin";
import { adminKeys } from "@/lib/query-keys";

export const adminUsersOptions = queryOptions({
  queryKey: adminKeys.users(),
});

export const adminUsersPageOptions = ({
  page,
  search,
  sortDirection,
}: {
  page: number;
  search?: string;
  sortDirection?: "asc" | "desc";
}) => {
  return queryOptions({
    queryKey: adminKeys.usersPage({ page, search, sortDirection }),
    queryFn: () =>
      authClient.admin.listUsers({
        query: {
          limit: ADMIN_USERS_PER_PAGE,
          offset: (page - 1) * ADMIN_USERS_PER_PAGE,

          ...(search && {
            searchValue: search,
            searchField: "email",
            searchOperator: "contains",
          }),
          ...(sortDirection && {
            sortBy: "createdAt",
            sortDirection,
          }),
        },
      }),
  });
};
