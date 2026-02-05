import { type Metadata } from "next";

import Content from "./content";

export const metadata: Metadata = {
  title: "Submit a Letter",
  alternates: {
    canonical: `/letters/submit`,
  },
};

export default function LetterSubmitPage() {
  return <Content />;
}
