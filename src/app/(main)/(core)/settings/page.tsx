import { type Metadata } from "next";

import Content from "./content";

export const metadata: Metadata = {
  title: "Account Settings",
  alternates: {
    canonical: `/settings`,
  },
};

export default function SettingsPage() {
  return <Content />;
}
