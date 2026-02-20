import { Paper } from '@mantine/core';

import classes from './auth.module.css';

export function AuthContainer({ children }: { children?: React.ReactNode }) {
  return (
    <Paper className={classes['paper-container']} withBorder>
      {children}
    </Paper>
  );
}
