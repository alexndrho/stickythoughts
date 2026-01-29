import type { Metadata } from "next";

import Layout from "./(main)/layout";
import NotFoundContent from "@/components/not-found-content";

export const metadata: Metadata = {
  title: "Page Not Found - StickyThoughts | Online Freedom Wall",
};

export default function NotFoundPage() {
  return (
    <Layout>
      <NotFoundContent />
    </Layout>
  );
}
