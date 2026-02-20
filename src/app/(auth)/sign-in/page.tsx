import { type Metadata } from 'next';

import Content from './content';

export const metadata: Metadata = {
  title: 'Sign In',
  alternates: {
    canonical: '/sign-in',
  },
};

export default function SignInPage() {
  return <Content />;
}
