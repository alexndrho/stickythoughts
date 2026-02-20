import { type Metadata } from 'next';

import Content from './content';

export const metadata: Metadata = {
  title: 'Sign Up',
  alternates: {
    canonical: '/sign-up',
  },
};

export default function SignUpPage() {
  return <Content />;
}
