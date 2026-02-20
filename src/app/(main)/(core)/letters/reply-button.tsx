import { Button, createPolymorphicComponent, type ButtonProps } from '@mantine/core';
import { IconMessageCircle } from '@tabler/icons-react';
import { forwardRef } from 'react';

export interface ReplyButtonProps extends ButtonProps {
  count: number;
}

const _ReplyButton = forwardRef<HTMLButtonElement, ReplyButtonProps>(({ count, ...props }, ref) => (
  <Button ref={ref} variant="default" leftSection={<IconMessageCircle size="1rem" />} {...props}>
    {count}
  </Button>
));
_ReplyButton.displayName = 'ReplyButton';

const ReplyButton = createPolymorphicComponent<'button', ReplyButtonProps>(_ReplyButton);

export default ReplyButton;
