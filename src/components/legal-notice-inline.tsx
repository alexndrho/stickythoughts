import Link from 'next/link';
import { Anchor, Text, type TextProps } from '@mantine/core';

type LegalNoticeInlineProps = TextProps & {
  variant?: 'auth' | 'submit';
};

export function LegalNoticeInline({
  size = 'xs',
  variant = 'auth',
  ...props
}: LegalNoticeInlineProps) {
  return (
    <Text size={size} {...props}>
      {variant === 'submit'
        ? 'By submitting, you agree to our '
        : 'By continuing, you agree to our '}
      <Anchor component={Link} href="/terms-and-conditions" inherit>
        Terms and Conditions
      </Anchor>
      .
    </Text>
  );
}
