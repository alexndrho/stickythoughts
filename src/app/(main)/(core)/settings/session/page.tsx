import { type Metadata } from 'next';
import Content from './content';

export const metadata: Metadata = {
  title: 'Session Settings',
  alternates: {
    canonical: `/settings/session`,
  },
};

export default function SessionPage() {
  return <Content />;
}
