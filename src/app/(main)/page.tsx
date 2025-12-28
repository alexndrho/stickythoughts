import { type Metadata } from "next";

import Content from "./Content";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
};

export default function HomePage() {
  return <Content />;
}
