import { queryOptions } from "@tanstack/react-query";

import { getAdminThoughts } from "@/services/moderate/thought";

export const adminOptions = queryOptions({
  queryKey: ["admin"],
});

export const adminThoughtsOptions = queryOptions({
  queryKey: [...adminOptions.queryKey, "thoughts"],
});

export const adminThoughtsPageOptions = (page: number) =>
  queryOptions({
    queryKey: [...adminThoughtsOptions.queryKey, page],
    queryFn: () => getAdminThoughts({ page }),
  });
