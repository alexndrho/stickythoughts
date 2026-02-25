'use client';

import { useLocalStorage } from '@mantine/hooks';

export function useLegalNoticeAcknowledgement() {
  const [isLegalNoticeAcknowledged, setIsLegalNoticeAcknowledged] = useLocalStorage<boolean>({
    key: 'is-legal-notice-acknowledged',
    defaultValue: false,
    getInitialValueInEffect: false,
  });

  return {
    isLegalNoticeAcknowledged,
    markAsLegalNoticeAcknowledged: () => setIsLegalNoticeAcknowledged(true),
  };
}
