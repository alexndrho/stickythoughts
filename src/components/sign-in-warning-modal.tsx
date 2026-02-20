import Link from 'next/link';
import { Button, Group, Modal, Text } from '@mantine/core';

export interface SignInWarningModalProps {
  opened: boolean;
  onClose: () => void;
}

export default function SignInWarningModal({ opened, onClose }: SignInWarningModalProps) {
  return (
    <Modal title="Sign in Required" opened={opened} onClose={onClose}>
      <Text>
        You must sign in first to access this feature. Please sign in or create an account.
      </Text>

      <Group justify="end">
        <Button variant="default" onClick={onClose}>
          Cancel
        </Button>

        <Button component={Link} href="/sign-in" onClick={onClose}>
          Sign in
        </Button>
      </Group>
    </Modal>
  );
}
