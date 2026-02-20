'use client';

import { Affix, Button, Transition } from '@mantine/core';
import { useWindowScroll } from '@mantine/hooks';
import { IconArrowBigUpFilled } from '@tabler/icons-react';
import classes from '../styles/scroll-up-button.module.css';

export default function ScrollUpButton() {
  const [scroll, scrollTo] = useWindowScroll();

  return (
    <Affix position={{ bottom: 20, right: 20 }} zIndex={90}>
      <Transition transition="slide-up" mounted={scroll.y > 0}>
        {(transitionStyles) => (
          <Button
            aria-label="Scroll to top"
            style={{ ...transitionStyles }}
            onClick={() => scrollTo({ y: 0 })}
            className={classes.button}
          >
            <IconArrowBigUpFilled />
          </Button>
        )}
      </Transition>
    </Affix>
  );
}
