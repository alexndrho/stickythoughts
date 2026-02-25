import type { Metadata } from 'next';
import { Anchor, List, ListItem, Text, Title } from '@mantine/core';

const LAST_UPDATED = '2026-02-25 (Asia/Manila)';

export const metadata: Metadata = {
  title: 'Terms and Conditions',
  alternates: {
    canonical: '/terms-and-conditions',
  },
};

export default function TermsPage() {
  return (
    <>
      <Title my="lg" fw="bold" ta="center">
        Terms and Conditions
      </Title>

      <Text my="md">Last updated: {LAST_UPDATED}</Text>

      <Title order={2} size="h4" mt="lg">
        Acceptance
      </Title>
      <Text my="sm">
        By using StickyThoughts, you agree to these Terms, our Privacy Policy, and Community
        Guidelines.
      </Text>

      <Title order={2} size="h4" mt="lg">
        User Content and Responsibility
      </Title>
      <Text my="sm">You are responsible for your posts, including anonymous posts.</Text>
      <List spacing="xs" my="sm">
        <ListItem>You must only post content you have the right to share.</ListItem>
        <ListItem>You must follow applicable law and platform rules.</ListItem>
        <ListItem>Anonymous posting does not remove legal responsibility.</ListItem>
      </List>

      <Title order={2} size="h4" mt="lg">
        Account Security
      </Title>
      <Text my="sm">
        You are responsible for keeping your login credentials confidential and for activity under
        your account. Contact us promptly if you suspect unauthorized account access.
      </Text>

      <Title order={2} size="h4" mt="lg">
        Prohibited Content
      </Title>
      <List spacing="xs" my="sm">
        <ListItem>Harassment, hate speech, threats, or incitement of violence</ListItem>
        <ListItem>Doxxing or sharing private/confidential information without permission</ListItem>
        <ListItem>Illegal content, including sexual content involving minors</ListItem>
        <ListItem>Spam, scams, impersonation, or platform abuse</ListItem>
        <ListItem>
          Aggressive, exploitative, disruptive, or spam-like advertising and promotional activity
        </ListItem>
        <ListItem>
          Limited, non-intrusive promotional sharing is only allowed when it is relevant and does
          not interfere with normal platform use
        </ListItem>
        <ListItem>Attempts to bypass anti-bot or rate-limit protections</ListItem>
      </List>

      <Title order={2} size="h4" mt="lg">
        Moderation and Enforcement
      </Title>
      <Text my="sm">
        We may review, reject, remove, restore, or permanently delete content, suspend or ban
        accounts, revoke sessions, and limit abusive traffic.
      </Text>

      <Title order={2} size="h4" mt="lg">
        Content License
      </Title>
      <Text my="sm">
        You keep ownership of your content. By posting, you give StickyThoughts a non-exclusive,
        worldwide, royalty-free license to host, store, display, adapt, and distribute your content
        only as needed to operate and secure the service.
      </Text>

      <Title order={2} size="h4" mt="lg">
        Availability and Liability
      </Title>
      <Text my="sm">
        The service is provided as-is and as-available with no uptime or accuracy guarantees. To the
        extent allowed by law, we are not liable for indirect or consequential damages.
      </Text>

      <Title order={2} size="h4" mt="lg">
        Governing Law
      </Title>
      <Text my="sm">
        These Terms are governed by the laws of the Republic of the Philippines, without regard to
        conflict of law principles.
      </Text>

      <Title order={2} size="h4" mt="lg">
        Disclaimers
      </Title>
      <List spacing="xs" my="sm">
        <ListItem>
          StickyThoughts contains user-generated content. User opinions are their own and do not
          represent StickyThoughts.
        </ListItem>
        <ListItem>
          Content is for general discussion only and is not professional advice (including legal,
          medical, mental health, or financial advice).
        </ListItem>
        <ListItem>
          We cannot guarantee every harmful or inaccurate post is detected immediately.
        </ListItem>
        <ListItem>
          We are not responsible for third-party websites or links shared by users.
        </ListItem>
      </List>

      <Title order={2} size="h4" mt="lg">
        DMCA / Copyright Complaints
      </Title>
      <Text my="sm">
        Send complaints to{' '}
        <Anchor href="mailto:support@stickythoughts.app">support@stickythoughts.app</Anchor> with
        your contact info, identified work, location/URL, good-faith statement, perjury statement,
        and signature.
      </Text>

      <Title order={2} size="h4" mt="lg">
        Changes
      </Title>
      <Text my="sm">
        We may update these Terms. Continued use after updates means you accept the revised Terms.
      </Text>
    </>
  );
}
