import { type Metadata } from 'next';
import Content from './content';

export const metadata: Metadata = {
  title: 'Notification Settings',
  alternates: {
    canonical: `/settings/notifications`,
  },
};

export default function NotificationsPage() {
  return <Content />;
}
