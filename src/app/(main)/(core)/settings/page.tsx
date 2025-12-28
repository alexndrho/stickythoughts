import { type Metadata } from "next";

import Content from "./Content";

export const metadata: Metadata = {
  title: "Settings",
  alternates: {
    canonical: `/settings`,
  },
};

export default function SettingsPage() {
  return <Content />;
}
