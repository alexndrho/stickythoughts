import { ThoughtColor } from '@/generated/prisma/enums';
import { CheckIcon, ColorSwatch, useMantineTheme } from '@mantine/core';

export interface CheckColorSwatchProps {
  color: ThoughtColor;
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
