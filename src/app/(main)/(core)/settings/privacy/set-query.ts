import { getQueryClient } from '@/lib/get-query-client';
import { userKeys } from '@/lib/query-keys/user';
import type { UserSettingsPrivacy } from '@/types/user';

export const setUserSettingsPrivacyQuery = ({
  privateLikes,
}: {
  privateLikes: NonNullable<UserSettingsPrivacy>['likesVisibility'];
}) => {
  const queryClient = getQueryClient();

  queryClient.setQueryData<UserSettingsPrivacy>(userKeys.privacy(), (oldData) => {
    if (oldData === undefined) return oldData;

    return {
      ...oldData,
      likesVisibility: privateLikes,
    };
  });

  queryClient.invalidateQueries({
    queryKey: userKeys.privacy(),
    refetchType: 'none',
  });
};
