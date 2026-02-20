'use client';

import { useRef } from 'react';
import { UnstyledButton } from '@mantine/core';
import { useThrottledCallback } from '@mantine/hooks';

import classes from '@/styles/random-button.module.css';
import { IconDiceFilled } from '@tabler/icons-react';

export interface RandomButtonProps {
  onClick: () => void;
}

export default function RandomButton({ onClick }: RandomButtonProps) {
  const randomColorButtonRef = useRef<HTMLButtonElement>(null);
  const randomColorTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleRandomColor = useThrottledCallback(() => {
    if (randomColorTimeoutRef.current) {
      randomColorButtonRef.current?.classList.remove(classes['random-button--clicked']);
      clearTimeout(randomColorTimeoutRef.current);
    }

    randomColorButtonRef.current?.classList.add(classes['random-button--clicked']);

    const randomColorTimeout = setTimeout(() => {
      randomColorButtonRef.current?.classList.remove(classes['random-button--clicked']);

      randomColorTimeoutRef.current = null;
    }, 500);

    randomColorTimeoutRef.current = randomColorTimeout;

    onClick();
  }, 750);

  return (
    <UnstyledButton
      ref={randomColorButtonRef}
      className={classes['random-button']}
      onClick={handleRandomColor}
      aria-label="Random Button"
    >
      <IconDiceFilled className={classes['dice-icon']} />
    </UnstyledButton>
  );
}
