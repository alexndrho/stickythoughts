import { Box, BoxProps, Title } from '@mantine/core';
import type { TablerIcon } from '@tabler/icons-react';
import type { ReactNode } from 'react';

import classes from '@/styles/components/empty-state.module.css';

export interface EmptyStateProps extends BoxProps {
  title: ReactNode;
  icon: TablerIcon;
  action?: ReactNode;
}

export default function EmptyState({ title, icon: Icon, action, ...props }: EmptyStateProps) {
  return (
    <Box className={classes.root} {...props}>
      <Icon size="3rem" className={classes.icon} aria-hidden="true" />

      <Title order={2} size="h3" className={classes.title}>
        {title}
      </Title>

      {action ? <div className={classes.action}>{action}</div> : null}
    </Box>
  );
}
