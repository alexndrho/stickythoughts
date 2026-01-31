import { type Metadata } from "next";

import Content from "./content";

export const metadata: Metadata = {
  title: "Thoughts",
  alternates: {
    canonical: "/dashboard/thoughts",
  },
};

export default function ThoughtsPage() {
  return <Content />;
}
