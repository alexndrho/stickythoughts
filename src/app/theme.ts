'use client';

import { createTheme, Menu, NavLink, Tooltip } from '@mantine/core';

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
    NavLink: NavLink.extend({
      defaultProps: {
        bdrs: 'sm',
      },
    }),
  },
});
