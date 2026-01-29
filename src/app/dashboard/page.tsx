import { type Metadata } from "next";
import Content from "./content";

export const metadata: Metadata = {
  title: "Dashboard",
  alternates: {
    canonical: "/dashboard",
  },
};

export default function AdminPage() {
  return <Content />;
}
