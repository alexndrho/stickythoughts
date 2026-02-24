import type { Metadata } from 'next';
import { Anchor, List, ListItem, Text, Title } from '@mantine/core';

const LAST_UPDATED = '2026-02-24 (Asia/Manila)';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  alternates: {
    canonical: '/privacy-policy',
  },
};

export default function PrivacyPage() {
  return (
    <>
      <Title my="lg" fw="bold" ta="center">
        Privacy Policy
      </Title>

      <Text my="md">Last updated: {LAST_UPDATED}</Text>

      <Title order={2} size="h4" mt="lg">
        What We Collect
      </Title>

      <Text fw={600} mt="sm">
        Anonymous posting data
      </Text>
      <List spacing="xs" my="sm">
        <ListItem>Thought posts: author, message, color, created timestamp</ListItem>
        <ListItem>
          Guest letter submissions: recipient, body, anonymous sender alias, status/timestamps
        </ListItem>
      </List>

      <Text fw={600} mt="sm">
        Account and profile data
      </Text>
      <List spacing="xs" my="sm">
        <ListItem>Email, username, display name</ListItem>
        <ListItem>Password credential data handled by our auth system</ListItem>
        <ListItem>Profile fields such as bio and profile image</ListItem>
        <ListItem>2FA data (secret and backup codes) if enabled</ListItem>
      </List>

      <Text fw={600} mt="sm">
        Session and security data
      </Text>
      <List spacing="xs" my="sm">
        <ListItem>Session metadata, token/expiry records</ListItem>
        <ListItem>IP address and user-agent in session records when available</ListItem>
        <ListItem>IP-derived rate-limit/security keys for abuse prevention</ListItem>
      </List>

      <Title order={2} size="h4" mt="lg">
        Cookies and Local Storage
      </Title>
      <List spacing="xs" my="sm">
        <ListItem>Authentication cookies are used to keep users signed in.</ListItem>
        <ListItem>
          Browser localStorage stores anonymous thought author text for convenient re-use.
        </ListItem>
      </List>

      <Title order={2} size="h4" mt="lg">
        Why We Process Data
      </Title>
      <List spacing="xs" my="sm">
        <ListItem>Provide and secure app features</ListItem>
        <ListItem>Operate moderation and anti-abuse controls</ListItem>
        <ListItem>Send account/security emails</ListItem>
        <ListItem>Improve reliability and performance</ListItem>
      </List>

      <Title order={2} size="h4" mt="lg">
        Tools and Providers
      </Title>
      <Text my="sm">
        The app uses providers for auth, database/cache, storage, analytics, anti-bot, CAPTCHA, and
        email delivery.
      </Text>

      <Title order={2} size="h4" mt="lg">
        International Data Transfers
      </Title>
      <Text my="sm">
        Data may be processed in countries where our service providers operate, which may be outside
        your country of residence.
      </Text>

      <Title order={2} size="h4" mt="lg">
        Retention
      </Title>
      <Text my="sm">
        Content can be soft-deleted first. Soft-deleted thoughts, letters, and replies are eligible
        for permanent deletion after about one month when purge jobs run.
      </Text>

      <Title order={2} size="h4" mt="lg">
        Children
      </Title>
      <Text my="sm">
        If we learn an account is below the minimum legal age in their jurisdiction, we may remove
        content and disable or delete the account.
      </Text>

      <Title order={2} size="h4" mt="lg">
        Contact
      </Title>
      <Text my="sm">
        Privacy questions:{' '}
        <Anchor href="mailto:support@stickythoughts.app">support@stickythoughts.app</Anchor>
      </Text>
    </>
  );
}
