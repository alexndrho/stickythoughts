import { type Metadata } from "next";

import Content from "./content";

export const metadata: Metadata = {
  title: "Deleted Content",
  alternates: {
    canonical: "/dashboard/deleted",
  },
};

export default function DeletedContentPage() {
  return <Content />;
}
