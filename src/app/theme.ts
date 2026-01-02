"use client";

import {
  createTheme,
  Menu,
  NavLink,
  Tooltip,
  TypographyStylesProvider,
} from "@mantine/core";

export const theme = createTheme({
  cursorType: "pointer",
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
    TypographyStylesProvider: TypographyStylesProvider.extend({
      styles: () => ({
        root: {
          overflowWrap: "break-word",
        },
      }),
    }),
    NavLink: NavLink.extend({
      defaultProps: {
        bdrs: "sm",
      },
    }),
  },
});
