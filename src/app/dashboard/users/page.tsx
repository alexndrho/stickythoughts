import { type Metadata } from "next";
import Content from "./content";

export const metadata: Metadata = {
  title: "Users",
  alternates: {
    canonical: "/dashboard/users",
  },
};

export default function AdminUsersPage() {
  return <Content />;
}
