import { type Metadata } from "next";
import Content from "./Content";

export const metadata: Metadata = {
  title: "Dashboard",
  alternates: {
    canonical: "/dashboard",
  },
};

export default function AdminPage() {
  return <Content />;
}
