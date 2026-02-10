import "client-only";

import { queryOptions } from "@tanstack/react-query";

import { getAdminThoughts } from "@/services/moderate/thought";
import { adminKeys } from "@/lib/query-keys";

export const adminOptions = queryOptions({
  queryKey: adminKeys.all(),
});

export const adminThoughtsOptions = queryOptions({
  queryKey: adminKeys.thoughts(),
});

export const adminThoughtsPageOptions = (page: number) =>
  queryOptions({
    queryKey: adminKeys.thoughtsPage(page),
    queryFn: () => getAdminThoughts({ page }),
  });
