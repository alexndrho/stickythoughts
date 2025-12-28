import { Box, Container, Flex } from "@mantine/core";

import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ScrollUpButton from "@/components/ScrollUpButton";

export default function CoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Flex mih="100dvh" h="100%" direction="column">
      <Nav />

      <Box flex={1}>
        <Container component="main" size="lg" h="100%">
          {children}
        </Container>
      </Box>

      <ScrollUpButton />
      <Footer />
    </Flex>
  );
}
