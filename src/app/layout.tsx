import type { Metadata, Viewport } from 'next';

import { ColorSchemeScript, DEFAULT_THEME, mantineHtmlProps, MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/spotlight/styles.css';
import '@mantine/carousel/styles.css';
import '@mantine/notifications/styles.css';

import Providers from './providers';
import { appFont } from './font';
import { theme } from './theme';
import { getBaseUrl } from '@/lib/seo/base-url.server';
import './global.css';

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: DEFAULT_THEME.white },
    { media: '(prefers-color-scheme: dark)', color: DEFAULT_THEME.colors.dark[7] },
  ],
};

export const metadata: Metadata = {
  title: {
    default: 'StickyThoughts - Your Digital Freedom Wall',
    template: '%s - StickyThoughts',
  },
  description:
    'Share your thoughts anonymously on StickyThoughts. Express yourself freely, connect with others, and discover authentic stories.',
  metadataBase: getBaseUrl(),
  icons: {
    icon: '/icon-192x192.png',
    apple: '/apple-touch-icon.png',
  },
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

      <body className={appFont.variable}>
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
