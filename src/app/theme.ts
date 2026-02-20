'use client';

import { createTheme, Menu, NavLink, Tooltip, Typography } from '@mantine/core';

export const theme = createTheme({
  cursorType: 'pointer',
  components: {
    Menu: Menu.extend({
      defaultProps: {
        withArrow: true,
      },
    }),
    Tooltip: Tooltip.extend({
      defaultProps: {
        withArrow: true,
      },
    }),
    Typography: Typography.extend({
      styles: () => ({
        root: {
          overflowWrap: 'break-word',
        },
      }),
    }),
    NavLink: NavLink.extend({
      defaultProps: {
        bdrs: 'sm',
      },
    }),
  },
});
