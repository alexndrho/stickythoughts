import { queryOptions } from "@tanstack/react-query";

import { adminOptions } from "../options";
import { getAdminThoughts } from "@/services/moderate/thought";

export const adminThoughtsOptions = queryOptions({
  queryKey: [...adminOptions.queryKey, "thoughts"],
});

export const adminThoughtsPageOptions = (page: number) =>
  queryOptions({
    queryKey: [...adminThoughtsOptions.queryKey, page],
    queryFn: () => getAdminThoughts({ page }),
  });
