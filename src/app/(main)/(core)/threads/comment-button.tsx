import {
  Button,
  createPolymorphicComponent,
  type ButtonProps,
} from "@mantine/core";
import { IconMessageCircle } from "@tabler/icons-react";
import { forwardRef } from "react";

export interface CommentButtonProps extends ButtonProps {
  count: number;
}

const _CommentButton = forwardRef<HTMLButtonElement, CommentButtonProps>(
  ({ count, ...props }, ref) => (
    <Button
      ref={ref}
      variant="default"
      leftSection={<IconMessageCircle size="1rem" />}
      {...props}
    >
      {count}
    </Button>
  ),
);
_CommentButton.displayName = "CommentButton";

const CommentButton = createPolymorphicComponent<"button", CommentButtonProps>(
  _CommentButton,
);

export default CommentButton;
