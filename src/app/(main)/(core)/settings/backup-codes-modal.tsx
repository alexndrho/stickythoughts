'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useForm } from '@mantine/form';
import {
  ActionIcon,
  Button,
  CopyButton,
  Group,
  Modal,
  Paper,
  PasswordInput,
  SimpleGrid,
  Text,
  Tooltip,
} from '@mantine/core';
import { authClient } from '@/lib/auth-client';

import classes from './account.module.css';
import { IconCheck, IconCopy, IconDownload } from '@tabler/icons-react';

export interface BackupCodesModalProps {
  opened: boolean;
  onClose: () => void;
}

export default function BackupCodesModal({ opened, onClose }: BackupCodesModalProps) {
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
  const [isBackupCodesDownloaded, setIsBackupCodesDownloaded] = useState(false);
  const [showConfirmClose, setShowConfirmClose] = useState(false);

  const form = useForm({
    initialValues: {
      password: '',
    },
  });

  const mutation = useMutation({
    mutationFn: (values: typeof form.values) =>
      authClient.twoFactor.generateBackupCodes({
        ...values,
      }),
    onSuccess: ({ data, error }) => {
      if (error?.message) {
        form.setErrors({ password: error.message });
      } else if (data) {
        setBackupCodes(data.backupCodes);
      } else {
        form.setErrors({ password: 'An unknown error occurred.' });
      }
    },
  });

  const handleDownloadCodes = () => {
    if (!backupCodes?.length) return;
    const contentLines = [
      `Backup Codes - Generated ${new Date().toLocaleString()}`,
      '',
      ...backupCodes,
      '',
      'Keep these codes in a safe place. Each code can only be used once.',
    ];
    const content = contentLines.join('\n');

    const blob = new Blob([content], { type: 'text/plain' });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');

    a.href = url;
    const timestamp = new Date().toISOString().split('T')[0];
    a.download = `backup-codes-${timestamp}.txt`;
    a.click();

    URL.revokeObjectURL(url);
    setIsBackupCodesDownloaded(true);
  };

  const handleClose = () => {
    setBackupCodes(null);
    setIsBackupCodesDownloaded(false);
    setShowConfirmClose(false);
    form.reset();
    onClose();
  };

  const handleCloseAttempt = () => {
    if (!showConfirmClose && backupCodes && backupCodes.length > 0 && !isBackupCodesDownloaded) {
      setShowConfirmClose(true);
    } else {
      handleClose();
    }
  };

  return (
    <Modal
      title="Backup Codes"
      opened={opened}
      onClose={handleCloseAttempt}
      closeOnClickOutside={!showConfirmClose}
      centered
    >
      {!backupCodes || backupCodes.length === 0 ? (
        <form onSubmit={form.onSubmit((values) => mutation.mutate(values))}>
          <PasswordInput label="Password" withAsterisk {...form.getInputProps('password')} />

          <Group mt="md" justify="end">
            <Button type="submit" loading={mutation.isPending}>
              Generate Backup Codes
            </Button>
          </Group>
        </form>
      ) : !showConfirmClose ? (
        <>
          <Text mb="md">
            Here are your backup codes. Each code can be used once to access your account if you
            lose access to your two-factor authentication method. Please store them in a safe place.
          </Text>

          <SimpleGrid cols={2}>
            {backupCodes?.map((code) => (
              <Paper key={code} withBorder className={classes['backup-codes-modal__code']}>
                <Text size="sm">{code}</Text>

                <CopyButton value={code}>
                  {({ copied, copy }) => (
                    <Tooltip label={copied ? 'Copied' : 'Copy'} position="right">
                      <ActionIcon variant="subtle" color={copied ? 'teal' : 'gray'} onClick={copy}>
                        {copied ? <IconCheck size="1em" /> : <IconCopy size="1em" />}
                      </ActionIcon>
                    </Tooltip>
                  )}
                </CopyButton>
              </Paper>
            ))}
          </SimpleGrid>

          <Button
            fullWidth
            mt="md"
            leftSection={<IconDownload size="1em" />}
            onClick={handleDownloadCodes}
          >
            Download Codes
          </Button>
        </>
      ) : (
        <>
          <Text>
            Are you sure you want to close? Make sure you have saved your backup codes in a safe
            place before closing.
          </Text>

          <Group mt="md" justify="end">
            <Button variant="default" onClick={() => setShowConfirmClose(false)}>
              Keep Backup Codes
            </Button>
            <Button color="red" onClick={handleClose}>
              Close Without Saving
            </Button>
          </Group>
        </>
      )}
    </Modal>
  );
}
