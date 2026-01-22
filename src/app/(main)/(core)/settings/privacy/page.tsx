import { type Metadata } from "next";
import Content from "./Content";

export const metadata: Metadata = {
  title: "Privacy Settings",
  alternates: {
    canonical: `/settings/privacy`,
  },
};

export default function PrivacyPage() {
  return <Content />;
}
