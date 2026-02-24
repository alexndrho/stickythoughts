'use client';

import Link from 'next/link';
import { Anchor, Box, Container, Divider, Group, Text, Title } from '@mantine/core';
import { IconCopyright } from '@tabler/icons-react';

import classes from '@/styles/footer.module.css';

export default function Footer() {
  return (
    <Box component="footer" className={classes['footer-container']}>
      <Container size="lg" className={classes['footer']}>
        <section>
          <Title order={2} size="h3">
            Sticky
            <Text span c="blue" inherit>
              Thoughts
            </Text>
          </Title>

          <Group gap={5}>
            <IconCopyright size="1.25em" />

            <Text span size="sm">
              2026{' '}
              <Anchor component={Link} href="/" inherit>
                StickyThoughts
              </Anchor>
              . All rights reserved.
            </Text>
          </Group>

          <Group gap={5}>
            <Anchor component={Link} href="/community-guidelines" size="sm">
              Community Guidelines
            </Anchor>

            <Divider orientation="vertical" />

            <Anchor component={Link} href="/terms-and-conditions" size="sm">
              Terms and Conditions
            </Anchor>

            <Divider orientation="vertical" />

            <Anchor component={Link} href="/privacy-policy" size="sm">
              Privacy Policy
            </Anchor>
          </Group>
        </section>

        <section>
          <Title order={2} size="h4">
            Contact
          </Title>

          <Anchor href="mailto:support@stickythoughts.app" className={classes.link}>
            support@stickythoughts.app
          </Anchor>

          <Anchor
            href="https://alexanderho.dev"
            target="_blank"
            rel="noopener"
            className={classes.link}
          >
            alexanderho.dev
          </Anchor>
        </section>
      </Container>
    </Box>
  );
}
