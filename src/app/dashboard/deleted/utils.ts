import { getFormattedDate } from '@/utils/date';
import { formatUserDisplayName } from '@/utils/user';

export const formatDeletedDate = (value: string | Date | null | undefined) => {
  if (!value) return '-';
  return getFormattedDate(value);
};

export const getPagedTotal = (totalCount: number | undefined, pageSize: number) => {
  const totalPages = Math.ceil((totalCount || 0) / pageSize);
  return Math.max(1, totalPages);
};

export const formatDeletedByLabel = (
  deletedBy?: {
    name: string | null;
    username: string;
  } | null,
) => {
  if (!deletedBy) return '-';

  return formatUserDisplayName(deletedBy);
};
