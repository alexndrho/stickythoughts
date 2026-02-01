import { queryOptions } from "@tanstack/react-query";

import { authClient } from "@/lib/auth-client";
import { adminOptions } from "../options";
import { ADMIN_USERS_PER_PAGE } from "@/config/admin";

export const adminUsersOptions = queryOptions({
  queryKey: [...adminOptions.queryKey, "users"],
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
  console.log("sortDirection", {
    ...(sortDirection && { sortDirection }),
  });

  return queryOptions({
    queryKey: [...adminOptions.queryKey, "users", page, search, sortDirection],
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
