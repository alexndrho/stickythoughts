import { type Metadata } from "next";

import Content from "./content";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
};

export default function HomePage() {
  return <Content />;
}
