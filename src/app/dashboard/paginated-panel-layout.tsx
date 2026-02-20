import { Pagination } from '@mantine/core';

import classes from './dashboard.module.css';

export interface PaginatedPanelLayoutProps {
  children: React.ReactNode;
  page: number;
  total: number;
  onPageChange: (page: number) => void;
  className?: string;
  contentClassName?: string;
  paginationClassName?: string;
}

export default function PaginatedPanelLayout({
  children,
  page,
  total,
  onPageChange,
  className,
  contentClassName,
  paginationClassName,
}: PaginatedPanelLayoutProps) {
  return (
    <section className={`${classes['paginated-panel__root']} ${className ?? ''}`}>
      <div className={`${classes['paginated-panel__content']} ${contentClassName ?? ''}`}>
        {children}
      </div>

      <div className={`${classes['paginated-panel__pagination']} ${paginationClassName ?? ''}`}>
        <Pagination value={page} onChange={onPageChange} total={total} />
      </div>
    </section>
  );
}
