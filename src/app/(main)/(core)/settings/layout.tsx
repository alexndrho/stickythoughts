import type { ReactNode } from 'react';
import type { Metadata } from 'next';

import classes from './layout.module.css';
import SettingsSidebar from './settings-sidebar';

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <div className={classes.container}>
      <SettingsSidebar />
      <section className={classes.content}>{children}</section>
    </div>
  );
}
