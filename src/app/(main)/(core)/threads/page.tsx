import { type Metadata } from "next";

import Content from "./Content";

export const metadata: Metadata = {
  title: "Threads",
  alternates: {
    canonical: `/threads`,
  },
};

export default function ThreadsPage() {
  return <Content />;
}
