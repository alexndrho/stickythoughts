import { type Metadata } from "next";

import Content from "./content";

export const metadata: Metadata = {
  title: "Letters",
  alternates: {
    canonical: `/letters`,
  },
};

export default function LettersPage() {
  return <Content />;
}
