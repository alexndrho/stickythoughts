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
import "@mantine/notifications/styles.css";

import Providers from "./providers";
import { theme } from "./theme";
import "./global.css";

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
    default: "StickyThoughts | Online Freedom Wall",
    template: "%s - StickyThoughts | Online Freedom Wall",
  },
  description:
    "StickyThoughts is an online freedom wall where you can express yourself freely and share your thoughts and experiences with others.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL!),
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
