import { THOUGHT_COLORS } from '@/config/thought';
import { CheckIcon, ColorSwatch, useMantineTheme } from '@mantine/core';

export interface CheckColorSwatchProps {
  color: (typeof THOUGHT_COLORS)[number];
  onClick?: () => void;
  checked?: boolean;
  disabled?: boolean;
}

export default function CheckColorSwatch({
  color,
  onClick,
  checked,
  disabled,
}: CheckColorSwatchProps) {
  const theme = useMantineTheme();

  return (
    <ColorSwatch
      aria-label={`thought-theme-${color}`}
      type="button"
      component="button"
      color={theme.colors[color][5]}
      disabled={disabled}
      onClick={onClick}
      styles={(theme) => ({
        root: {
          cursor: 'pointer',
          color: theme.colors.gray[0],
        },
      })}
    >
      {checked && <CheckIcon width="0.75em" />}
    </ColorSwatch>
  );
}
