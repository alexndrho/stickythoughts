import { Body, Container, Head, Html, Text, Hr } from '@react-email/components';

interface EmailOTPTemplateProps {
  otp: string;
  type: 'sign-in' | 'email-verification' | 'forget-password';
}

export default function EmailOTPTemplate({ otp, type }: EmailOTPTemplateProps) {
  const getSubject = () => {
    switch (type) {
      case 'sign-in':
        return 'Sign In to StickyThoughts';
      case 'email-verification':
        return 'Verify Your Email - StickyThoughts';
      case 'forget-password':
        return 'Reset Your Password - StickyThoughts';
      default:
        return 'Your OTP Code - StickyThoughts';
    }
  };

  const getHeading = () => {
    switch (type) {
      case 'sign-in':
        return 'Sign In to Your Account';
      case 'email-verification':
        return 'Verify Your Email Address';
      case 'forget-password':
        return 'Reset Your Password';
      default:
        return 'Your Verification Code';
    }
  };

  const getMessage = () => {
    switch (type) {
      case 'sign-in':
        return 'Use the verification code below to sign in to your StickyThoughts account:';
      case 'email-verification':
        return 'Thank you for signing up for StickyThoughts! Please use the verification code below to verify your email address:';
      case 'forget-password':
        return 'You requested to reset your password for your StickyThoughts account. Use the verification code below to continue:';
      default:
        return 'Your verification code:';
    }
  };

  const getFooterMessage = () => {
    switch (type) {
      case 'sign-in':
        return "If you didn't request this sign-in, please ignore this email or contact support if you have concerns.";
      case 'email-verification':
        return "If you didn't create an account with StickyThoughts, please ignore this email.";
      case 'forget-password':
        return "If you didn't request a password reset, please ignore this email. Your password will remain unchanged.";
      default:
        return "If you didn't request this code, please ignore this email.";
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

          <Text>{otp}</Text>

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
