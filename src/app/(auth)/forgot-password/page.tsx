import { type Metadata } from 'next';

import Content from './content';

export const metadata: Metadata = {
  title: 'Forgot Password',
  alternates: {
    canonical: '/forgot-password',
  },
};

export default function ForgotPasswordPage() {
  return <Content />;
}
