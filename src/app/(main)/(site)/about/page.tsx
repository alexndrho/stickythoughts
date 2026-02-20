import type { Metadata } from 'next';
import { Anchor, Box, Flex, Image as MantineImage, Text, Title } from '@mantine/core';
import Image from 'next/image';

import noteImg from '@/assets/note.svg';

export const metadata: Metadata = {
  title: 'About',
  alternates: {
    canonical: '/about',
  },
};

export default function AboutPage() {
  return (
    <Flex h="100%" py="lg" align="center" gap="md">
      <Box>
        <Title>
          Sticky
          <Text span c="blue" inherit>
            Thoughts
          </Text>
          <Text span display="block" fz="xl" fs="italic">
            Your Digital Freedom Wall
          </Text>
        </Title>

        <Text mt="lg" fz="lg">
          StickyThoughts is a digital freedom wall where you can express yourself freely and share
          your thoughts, experiences, and stories with others. Whether you choose to remain
          anonymous or share openly, this is your space to be heard.
        </Text>

        <Text mt="lg" fz="lg">
          Post your thoughts, share experiences, confess secrets, or simply express how you&apos;re
          feeling. Customize your notes with different colors, browse thoughts from others, and
          create as many posts as you want. Whether you choose to stay anonymous or share your name,
          this is your safe space for honest expression.
        </Text>

        <Text mt="lg" fz="lg">
          StickyThoughts is an open source project available on{' '}
          <Anchor href="https://github.com/alexndrho/stickythoughts" target="_blank" inherit>
            GitHub
          </Anchor>
          , created by{' '}
          <Anchor href="https://www.alexanderho.dev" target="_blank" inherit>
            Alexander Gabriel Ho
          </Anchor>
          . Built as an emotional outlet and community platform for authentic connection.
        </Text>
      </Box>

      <Box display={{ base: 'none', xs: 'block' }}>
        <MantineImage w={250} h={250} component={Image} src={noteImg} alt="StickyThoughts Logo" />
      </Box>
    </Flex>
  );
}
