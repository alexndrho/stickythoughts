import { getQueryClient } from "@/lib/get-query-client";
import { userSettingsPrivacy } from "./options";
import type { UserSettingsPrivacy } from "@/types/user";

export const setUserSettingsPrivacyQuery = ({
  privateLikes,
}: {
  privateLikes: NonNullable<UserSettingsPrivacy>["likesVisibility"];
}) => {
  const queryClient = getQueryClient();

  queryClient.setQueryData<UserSettingsPrivacy>(
    userSettingsPrivacy.queryKey,
    (oldData) => {
      if (oldData === undefined) return oldData;

      return {
        ...oldData,
        likesVisibility: privateLikes,
      };
    },
  );

  queryClient.invalidateQueries({
    queryKey: userSettingsPrivacy.queryKey,
    refetchType: "none",
  });
};
