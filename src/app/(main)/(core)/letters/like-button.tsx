import { Button, type ButtonProps } from '@mantine/core';
import { IconHeart, IconHeartFilled } from '@tabler/icons-react';

export interface LikeButtonProps extends ButtonProps {
  count: number;
  liked: boolean;
  onLike?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export default function LikeButton({ count, liked, onLike, ...props }: LikeButtonProps) {
  return (
    <Button
      variant="default"
      c={liked ? 'red.6' : undefined}
      leftSection={liked ? <IconHeartFilled size="1rem" /> : <IconHeart size="1rem" />}
      onClick={onLike}
      {...props}
    >
      {count}
    </Button>
  );
}
