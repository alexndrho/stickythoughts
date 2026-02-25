import type { Metadata } from 'next';
import { Anchor, List, ListItem, Text, Title } from '@mantine/core';

const LAST_UPDATED = '2026-02-25 (Asia/Manila)';

export const metadata: Metadata = {
  title: 'Community Guidelines',
  alternates: {
    canonical: '/community-guidelines',
  },
};

export default function CommunityGuidelinesPage() {
  return (
    <>
      <Title my="lg" fw="bold" ta="center">
        Community Guidelines
      </Title>

      <Text my="md">Last updated: {LAST_UPDATED}</Text>

      <Title order={2} size="h4" mt="lg">
        Keep It Respectful
      </Title>
      <List spacing="xs" my="sm">
        <ListItem>No harassment, hate speech, or bullying</ListItem>
        <ListItem>No threats, intimidation, or incitement of violence</ListItem>
        <ListItem>Debate ideas without attacking people</ListItem>
      </List>

      <Title order={2} size="h4" mt="lg">
        Protect Privacy
      </Title>
      <List spacing="xs" my="sm">
        <ListItem>No doxxing or sharing personal info without consent</ListItem>
        <ListItem>No posting confidential records, credentials, or private messages</ListItem>
      </List>

      <Title order={2} size="h4" mt="lg">
        Keep It Lawful and Safe
      </Title>
      <List spacing="xs" my="sm">
        <ListItem>No illegal content</ListItem>
        <ListItem>Zero tolerance for sexual content involving minors</ListItem>
        <ListItem>No scams, phishing, botting, or spam campaigns</ListItem>
        <ListItem>
          Content expressing personal struggles is allowed, but content that encourages, instructs,
          or glorifies self-harm is prohibited
        </ListItem>
      </List>

      <Title order={2} size="h4" mt="lg">
        Promotional Content
      </Title>
      <List spacing="xs" my="sm">
        <ListItem>
          Aggressive, exploitative, or disruptive advertising and promotional behavior is prohibited
        </ListItem>
        <ListItem>
          No spam-like repetition, mass posting, or engagement manipulation for promotion
        </ListItem>
        <ListItem>
          Reasonable, non-intrusive sharing is allowed when relevant to the discussion and aligned
          with the platform&apos;s purpose
        </ListItem>
      </List>

      <Title order={2} size="h4" mt="lg">
        Moderation and Enforcement
      </Title>
      <Text my="sm">
        We may reject/remove content, ban accounts, revoke sessions, or restrict abusive traffic.
        Guest or unverified letter submissions may be reviewed before publication.
      </Text>

      <Title order={2} size="h4" mt="lg">
        Reporting
      </Title>
      <Text my="sm">
        To report harmful or infringing content, email details and links to{' '}
        <Anchor href="mailto:support@stickythoughts.app">support@stickythoughts.app</Anchor>.
      </Text>
    </>
  );
}
