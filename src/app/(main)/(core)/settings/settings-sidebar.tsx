'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NavLink } from '@mantine/core';
import { IconBell, IconClock, IconLock, IconUser } from '@tabler/icons-react';

import classes from './layout.module.css';

const navLinks = [
  {
    icon: <IconUser size="1em" />,
    label: 'Account',
    href: '/settings',
  },
  {
    icon: <IconLock size="1em" />,
    label: 'Privacy',
    href: '/settings/privacy',
  },
  {
    icon: <IconBell size="1em" />,
    label: 'Notifications',
    href: '/settings/notifications',
  },
  {
    icon: <IconClock size="1em" />,
    label: 'Session',
    href: '/settings/session',
  },
];

export default function SettingsSidebar() {
  const pathname = usePathname();

  return (
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
  );
}
