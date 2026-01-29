"use client";

import { useCallback, useRef } from "react";

export interface InfiniteScrollProps {
  children: React.ReactNode;
  onLoadMore: () => void;
  hasNext: boolean;
  loading: boolean;
  loader?: React.ReactNode;
}

export default function InfiniteScroll({
  children,
  onLoadMore,
  hasNext,
  loading,
  loader,
}: InfiniteScrollProps) {
  const observer = useRef<IntersectionObserver | null>(null);

  const lastItemRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNext) {
          onLoadMore();
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, hasNext, onLoadMore],
  );

  return (
    <>
      {children}
      <div ref={lastItemRef} />
      {loading && loader}
    </>
  );
}
