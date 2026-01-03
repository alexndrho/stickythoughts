"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavLink } from "@mantine/core";
import { IconClock, IconUser } from "@tabler/icons-react";

import classes from "./layout.module.css";

const navLinks = [
  {
    icon: <IconUser size="1em" />,
    label: "Account",
    href: "/settings",
  },
  {
    icon: <IconClock size="1em" />,
    label: "Session",
    href: "/settings/session",
  },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className={classes.container}>
      <aside className={classes.sidebar}>
        {navLinks.map((link) => (
          <NavLink
            key={link.label}
            label={link.label}
            component={Link}
            href={link.href}
            leftSection={link.icon}
            active={pathname === link.href}
          />
        ))}
      </aside>

      <div className={classes.content}>{children}</div>
    </div>
  );
}
