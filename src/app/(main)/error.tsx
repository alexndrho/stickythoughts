"use client";

import { useEffect } from "react";

import NotFoundContent from "@/components/status/not-found-content";
import RateLimitExceededContent from "@/components/status/rate-limit-exceeded-content";

function isRateLimitError(error: unknown): boolean {
  // In App Router, server-thrown errors can lose prototype during serialization.
  return (
    typeof error === "object" &&
    error !== null &&
    (error as { name?: unknown }).name === "RateLimitExceededError"
  );
}

export default function Error(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Keep a breadcrumb in the console for debugging.
    console.error(props.error);
  }, [props.error]);

  if (isRateLimitError(props.error)) {
    return (
      <RateLimitExceededContent error={props.error} onRetry={props.reset} />
    );
  }

  // Fallback: treat as generic failure. We already have a consistent "not found"
  // component; it's better than a blank screen, but this still indicates failure.
  return <NotFoundContent />;
}
