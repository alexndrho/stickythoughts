import { type Metadata } from "next";

import Content from "./content";

export const metadata: Metadata = {
  title: "Thoughts",
  alternates: {
    canonical: "/dashboard",
  },
};

export default function AdminThoughtsPage() {
  return <Content />;
}
