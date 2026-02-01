import { formatUserDisplayName } from "@/utils/user";

export const formatDeletedDate = (value: string | Date | null | undefined) => {
  if (!value) return "-";
  const date = value instanceof Date ? value : new Date(value);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });
};

export const getPagedTotal = (
  totalCount: number | undefined,
  pageSize: number,
) => {
  const totalPages = Math.ceil((totalCount || 0) / pageSize);
  return Math.max(1, totalPages);
};

export const formatDeletedByLabel = (deletedBy?: {
  name: string | null;
  username: string;
} | null) => {
  if (!deletedBy) return "-";

  return formatUserDisplayName(deletedBy);
};
