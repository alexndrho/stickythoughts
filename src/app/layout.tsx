import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import {
  ColorSchemeScript,
  mantineHtmlProps,
  MantineProvider,
} from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/spotlight/styles.css";
import "@mantine/tiptap/styles.css";
import "@mantine/carousel/styles.css";
import "@mantine/notifications/styles.css";

import Providers from "./providers";
import { theme } from "./theme";
import "./global.css";

import { getBaseUrl } from "@/lib/seo/base-url.server";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "StickyThoughts - Your Digital Freedom Wall",
    template: "%s - StickyThoughts",
  },
  description:
    "Share your thoughts anonymously on StickyThoughts. Express yourself freely, connect with others, and discover authentic stories.",
  metadataBase: getBaseUrl(),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript defaultColorScheme="auto" />
      </head>

      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <MantineProvider defaultColorScheme="auto" theme={theme}>
          <Providers>{children}</Providers>
          <Notifications />

          <Analytics />
          <SpeedInsights />
        </MantineProvider>
      </body>
    </html>
  );
}
