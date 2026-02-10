import type { ReactNode } from "react";

import classes from "./layout.module.css";
import SettingsSidebar from "./settings-sidebar";

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <div className={classes.container}>
      <SettingsSidebar />
      <section className={classes.content}>{children}</section>
    </div>
  );
}

