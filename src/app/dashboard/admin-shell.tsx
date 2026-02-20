'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useDisclosure } from '@mantine/hooks';
import { AppShell, Burger, Group, NavLink, Text } from '@mantine/core';
import { IconHome, IconInbox, IconMessage, IconTrash, IconUser } from '@tabler/icons-react';

import { authClient } from '@/lib/auth-client';
import classes from './layout.module.css';

type AdminCheckParams = Parameters<typeof authClient.admin.checkRolePermission>[0];
type AdminPermissions = NonNullable<
  Extract<AdminCheckParams, { permissions: unknown }>['permissions']
>;

type NavLinkConfig = {
  icon: React.ReactNode;
  label: string;
  href: string;
  permissions?: AdminPermissions;
};

const navLinks: NavLinkConfig[] = [
  {
    icon: <IconMessage size="1em" />,
    label: 'Thoughts',
    href: '/dashboard',
    permissions: {
      thought: ['list'],
    },
  },
  {
    icon: <IconInbox size="1em" />,
    label: 'Submissions',
    href: '/dashboard/submissions',
    permissions: {
      letter: ['list-submissions'],
    },
  },
  {
    icon: <IconUser size="1em" />,
    label: 'Users',
    href: '/dashboard/users',
    permissions: {
      user: ['list'],
    },
  },
  {
    icon: <IconTrash size="1em" />,
    label: 'Deleted',
    href: '/dashboard/deleted',
    permissions: {
      thought: ['list-deleted'],
      letter: ['list-deleted'],
      letterReply: ['list-deleted'],
    },
  },
];

export interface AdminShellProps {
  role: 'admin' | 'moderator';
}

export default function AdminShell({ children, role }: React.PropsWithChildren<AdminShellProps>) {
  const pathname = usePathname();
  const [opened, { toggle, close }] = useDisclosure();

  return (
    <AppShell
      padding="md"
      header={{ height: { base: 70 } }}
      navbar={{
        width: { base: 300 },
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
    >
      <AppShell.Header>
        <Group h="100%" px="md">
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />

          <Text component={Link} href="/dashboard" fz="xl" fw={700}>
            Sticky
            <Text span c="blue" inherit>
              Thoughts
            </Text>
          </Text>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        {navLinks
          .filter((link) => {
            return link.permissions
              ? authClient.admin.checkRolePermission({
                  role,
                  permissions: link.permissions,
                })
              : true;
          })
          .map((link) => (
            <NavLink
              key={link.label}
              component={Link}
              href={link.href}
              label={link.label}
              leftSection={link.icon}
              active={pathname === link.href}
              onClick={() => {
                close();
              }}
            />
          ))}

        <NavLink
          mt="auto"
          component={Link}
          href="/"
          label="Go back to app"
          color="red"
          active
          leftSection={<IconHome size="1em" />}
        />
      </AppShell.Navbar>

      <AppShell.Main className={classes.shell__main}>{children}</AppShell.Main>
    </AppShell>
  );
}
