import { type Metadata } from "next";

import Content from "./content";

export const metadata: Metadata = {
  title: "Submit a Thread",
  alternates: {
    canonical: `/threads/submit`,
  },
};

export default function ThreadSubmitPage() {
  return <Content />;
}
