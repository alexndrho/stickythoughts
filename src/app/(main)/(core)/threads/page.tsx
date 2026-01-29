import { type Metadata } from "next";

import Content from "./content";

export const metadata: Metadata = {
  title: "Threads",
  alternates: {
    canonical: `/threads`,
  },
};

export default function ThreadsPage() {
  return <Content />;
}
