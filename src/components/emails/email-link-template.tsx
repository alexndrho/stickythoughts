import {
  Body,
  Container,
  Head,
  Html,
  Text,
  Hr,
  Link,
} from "@react-email/components";

interface EmailLinkTemplateProps {
  url: string;
  type: "email-verification" | "email-change";
}

export default function EmailLinkTemplate({
  url,
  type,
}: EmailLinkTemplateProps) {
  const getSubject = () => {
    switch (type) {
      case "email-verification":
        return "Verify Your Email - StickyThoughts";
      case "email-change":
        return "Approve Your Email Change - StickyThoughts";
      default:
        return "StickyThoughts";
    }
  };

  const getHeading = () => {
    switch (type) {
      case "email-verification":
        return "Verify Your Email Address";
      case "email-change":
        return "Approve Your Email Change";
      default:
        return "StickyThoughts";
    }
  };

  const getMessage = () => {
    switch (type) {
      case "email-verification":
        return "Thank you for signing up for StickyThoughts! Click the link below to verify your email address:";
      case "email-change":
        return "You requested to change your email address for your StickyThoughts account. Click the link below to approve your email change:";
      default:
        return "Click the link below:";
    }
  };

  const getLinkText = () => {
    switch (type) {
      case "email-verification":
        return "Verify Email";
      case "email-change":
        return "Approve Email Change";
      default:
        return "Continue";
    }
  };

  const getFooterMessage = () => {
    switch (type) {
      case "email-verification":
        return "If you didn't create an account with StickyThoughts, please ignore this email.";
      case "email-change":
        return "If you didn't request an email change, please ignore this email.";
      default:
        return "If you didn't request this, please ignore this email.";
    }
  };

  return (
    <Html>
      <Head>
        <title>{getSubject()}</title>
      </Head>

      <Body>
        <Container>
          <Text>StickyThoughts</Text>

          <Text>{getHeading()}</Text>

          <Text>Hello,</Text>

          <Text>{getMessage()}</Text>

          <Link href={url}>{getLinkText()}</Link>

          <Hr />

          <Text>{getFooterMessage()}</Text>

          <Text>
            Best regards,
            <br />
            StickyThoughts
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
