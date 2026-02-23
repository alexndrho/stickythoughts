'use client';

import { createTheme, DEFAULT_THEME, Menu, NavLink, Tooltip } from '@mantine/core';
import { appFont } from './font';

export const theme = createTheme({
  cursorType: 'pointer',
  fontFamily: appFont.style.fontFamily,
  headings: { fontFamily: `${appFont.style.fontFamily} ${DEFAULT_THEME.fontFamily}` },
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
