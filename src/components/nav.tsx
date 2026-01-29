"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  ActionIcon,
  Anchor,
  Avatar,
  Button,
  Container,
  Divider,
  Group,
  Menu,
  Text,
  Tooltip,
  UnstyledButton,
  useMantineColorScheme,
} from "@mantine/core";
import {
  IconSun,
  IconMoon,
  IconLogout,
  IconSettings,
  IconMenu,
  IconHome,
  IconInfoCircle,
  IconAddressBook,
  IconLogin,
  IconUser,
  IconMessage,
  IconBell,
  IconTools,
  IconLink,
} from "@tabler/icons-react";
import { useThrottledCallback } from "@mantine/hooks";

import { authClient } from "@/lib/auth-client";
import { getQueryClient } from "@/lib/get-query-client";
import { thoughtsInfiniteOptions, thoughtsOptions } from "@/app/(main)/options";
import UserNotification from "./user-notification";
import classes from "@/styles/nav.module.css";

const navLinks = [
  {
    label: "Home",
    icon: IconHome,
    href: "/",
  },
  {
    label: "Threads",
    icon: IconMessage,
    href: "/threads",
  },
  {
    label: "About",
    icon: IconInfoCircle,
    href: "/about",
  },
  {
    label: "Contact",
    icon: IconAddressBook,
    href: "/contact",
  },
];

export default function Nav() {
  const pathname = usePathname();
  const { setColorScheme } = useMantineColorScheme();

  const { data: session } = authClient.useSession();

  const handleRefetch = useThrottledCallback(() => {
    getQueryClient().invalidateQueries({
      queryKey: thoughtsInfiniteOptions.queryKey,
    });
    getQueryClient().invalidateQueries({
      queryKey: thoughtsOptions.queryKey,
    });
  }, 10000);

  const signOut = () => {
    authClient.signOut();
    const queryClient = getQueryClient();
    queryClient.clear();
  };

  return (
    <header>
      <div className={classes["nav-container"]}>
        <Container size="lg" className={classes.nav}>
          <Text
            component={Link}
            href="/"
            fz="xl"
            fw={700}
            onClick={(e) => {
              if (pathname === "/") {
                e.preventDefault();
                handleRefetch();
              }
            }}
          >
            Sticky
            <Text span c="blue" inherit>
              Thoughts
            </Text>
          </Text>

          <Group>
            <Group component="nav">
              <Group className={classes["desktop-nav-links"]}>
                {navLinks.map((link) => (
                  <Button
                    key={link.label}
                    component={Link}
                    href={link.href}
                    variant="subtle"
                    size="compact-sm"
                  >
                    {link.label}
                  </Button>
                ))}
              </Group>

              <div className={classes["mobile-menu"]}>
                <MobileMenu isAuthenticated={!!session} />
              </div>
            </Group>

            <Divider orientation="vertical" />

            {session ? (
              <>
                <UserNotification session={session}>
                  <ActionIcon aria-label="Notifications" variant="default">
                    <IconBell size="1em" />
                  </ActionIcon>
                </UserNotification>

                <UserMenu
                  session={session}
                  signOut={signOut}
                  setColorScheme={setColorScheme}
                />
              </>
            ) : (
              <>
                <div className={classes["desktop-unauthenticated-links"]}>
                  <Button component={Link} href="/sign-in" size="compact-sm">
                    Sign in
                  </Button>
                </div>

                <ToggleTheme setColorScheme={setColorScheme} />
              </>
            )}
          </Group>
        </Container>
      </div>

      {session?.user.isAnonymous && (
        <div className={classes["anonymous-bar-container"]}>
          <Container size="lg" className={classes["anonymous-bar"]}>
            <Text size="sm" className={classes["anonymous-bar__text"]}>
              <IconLink size="1.25em" />
              <Text span inherit>
                <Text span inherit fw="bold">
                  You are browsing anonymously.
                </Text>{" "}
                Sign in to save your data and sync across devices.
              </Text>
            </Text>

            <Anchor component={Link} href="/sign-up" size="sm" c="yellow">
              Create Account
            </Anchor>
          </Container>
        </div>
      )}
    </header>
  );
}

function MobileMenu({
  isAuthenticated = false,
}: {
  isAuthenticated?: boolean;
}) {
  return (
    <Menu>
      <Menu.Target>
        <ActionIcon aria-label="toggle menu" variant="default">
          <IconMenu size="1em" />
        </ActionIcon>
      </Menu.Target>

      <Menu.Dropdown>
        {!isAuthenticated && (
          <>
            <Menu.Item
              component={Link}
              href="/sign-in"
              leftSection={<IconLogin size="1em" />}
            >
              Sign in
            </Menu.Item>

            <Menu.Divider />
          </>
        )}

        {navLinks.map((link) => (
          <Menu.Item
            key={link.label}
            component={Link}
            href={link.href}
            leftSection={<link.icon size="1em" />}
          >
            {link.label}
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
}

function UserMenu({
  session,
  signOut,
  setColorScheme,
}: {
  session: NonNullable<ReturnType<typeof authClient.useSession>["data"]>;
  signOut: () => void;
  setColorScheme: (value: "light" | "dark") => void;
}) {
  return (
    <Menu>
      <Menu.Target>
        <Avatar component={UnstyledButton} src={session.user?.image} />
      </Menu.Target>

      <Menu.Dropdown>
        {session.user && (
          <>
            {session.user.role === "admin" && (
              <>
                <Menu.Item
                  component={Link}
                  href="/dashboard"
                  leftSection={<IconTools size="1em" />}
                >
                  Dashboard
                </Menu.Item>

                <Menu.Divider />
              </>
            )}

            <Menu.Item
              component={Link}
              href={`/user/${session.user.username}`}
              leftSection={<IconUser size="1em" />}
            >
              Profile
            </Menu.Item>
          </>
        )}

        <Menu.Item
          component={Link}
          href="/settings"
          leftSection={<IconSettings size="1em" />}
        >
          Settings
        </Menu.Item>

        <Menu.Item
          leftSection={<IconMoon size="1em" />}
          className="darkHidden"
          onClick={() => setColorScheme("dark")}
        >
          Dark mode
        </Menu.Item>

        <Menu.Item
          leftSection={<IconSun size="1em" />}
          className="lightHidden"
          onClick={() => setColorScheme("light")}
        >
          Light mode
        </Menu.Item>

        <Menu.Divider />

        <Menu.Item
          color="red"
          leftSection={<IconLogout size="1em" />}
          onClick={signOut}
        >
          Sign out
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}

function ToggleTheme({
  setColorScheme,
}: {
  setColorScheme: (value: "light" | "dark") => void;
}) {
  return (
    <>
      <Tooltip label="Dark mode" position="bottom" className="darkHidden">
        <ActionIcon
          aria-label="Toggle color scheme"
          variant="default"
          onClick={() => setColorScheme("dark")}
        >
          <IconMoon size="1em" />
        </ActionIcon>
      </Tooltip>

      <Tooltip label="Light mode" position="bottom" className="lightHidden">
        <ActionIcon
          aria-label="Toggle color scheme"
          variant="default"
          onClick={() => setColorScheme("light")}
        >
          <IconSun size="1em" />
        </ActionIcon>
      </Tooltip>
    </>
  );
}
