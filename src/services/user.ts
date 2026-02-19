import "client-only";

import { fetchJson } from "@/services/http";
import type {
  UserNotification,
  UserNotificationDTO,
  UserAccountSettings,
  UserAccountSettingsDTO,
  UserPublicAccount,
  UserPublicAccountDTO,
  UserSettingsPrivacy,
  UserSettingsPrivacyDTO,
  UpdateUserBioBody,
  UpdateUserLikesVisibilityBody,
  UserNotificationMarkReadBody,
  UserNotificationOpenedBody,
} from "@/types/user";
import type {
  Letter,
  LetterDTO,
  UserLetterReply,
  UserLetterReplyDTO,
} from "@/types/letter";

export const getUser = async (
  username: string,
  cookie?: string,
): Promise<UserPublicAccount> => {
  return fetchJson<UserPublicAccountDTO>(
    `/api/user/${username}`,
    {
      headers: {
        ...(cookie ? { cookie } : {}),
      },
    },
    { errorMessage: "User fetch error" },
  );
};

export const getUserAccountSettings =
  async (): Promise<UserAccountSettings> => {
    return fetchJson<UserAccountSettingsDTO>("/api/user/settings", undefined, {
      errorMessage: "User profile fetch error",
    });
  };

export const updateUserBio = async (
  body: UpdateUserBioBody,
): Promise<{ bio: string }> => {
  return fetchJson(
    "/api/user/bio",
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
    { errorMessage: "User bio update error" },
  );
};

// allows admins to delete a user's bio. note: users can clear their own bio by setting it to an empty string.
export const deleteUserBio = async (
  id: string,
): Promise<{ message: string }> => {
  const searchParams = new URLSearchParams();
  // API expects `userId`
  searchParams.append("userId", id);

  return fetchJson(
    `/api/user/bio?${searchParams.toString()}`,
    {
      method: "DELETE",
    },
    { errorMessage: "User bio delete error" },
  );
};

export const uploadProfilePicture = async (
  formData: FormData,
): Promise<{ image: string }> => {
  return fetchJson(
    "/api/user/profile-picture",
    {
      method: "PUT",
      body: formData,
    },
    { errorMessage: "Profile picture upload error" },
  );
};

export const removeProfilePicture = async ({
  userId,
  cookie,
}: { userId?: string; cookie?: string } = {}): Promise<{ message: string }> => {
  const searchParams = new URLSearchParams();
  if (userId) {
    searchParams.append("userId", userId);
  }

  return fetchJson(
    `/api/user/profile-picture?${searchParams.toString()}`,
    {
      method: "DELETE",
      headers: {
        ...(cookie ? { cookie } : {}),
      },
    },
    { errorMessage: "Profile picture delete error" },
  );
};

export const getUserSettingsPrivacy =
  async (): Promise<UserSettingsPrivacy> => {
    return fetchJson<UserSettingsPrivacyDTO>(
      "/api/user/settings/privacy",
      undefined,
      {
        errorMessage: "User settings privacy fetch error",
      },
    );
  };

export const updateUserLikesVisibility = async (
  body: UpdateUserLikesVisibilityBody,
): Promise<UserSettingsPrivacy> => {
  return fetchJson<UserSettingsPrivacyDTO>(
    "/api/user/settings/privacy/likes-visibility",
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
    { errorMessage: "User likes visibility update error" },
  );
};

export const getUserNotifications = async (
  lastUpdatedAt?: Date,
): Promise<UserNotification[]> => {
  const searchParams = new URLSearchParams();

  if (lastUpdatedAt) {
    searchParams.append("lastUpdatedAt", lastUpdatedAt.toISOString());
  }

  return fetchJson<UserNotificationDTO[]>(
    `/api/user/notifications?${searchParams.toString()}`,
    undefined,
    { errorMessage: "User notifications fetch error" },
  );
};

export const userNotificationOpened = async (
  body?: UserNotificationOpenedBody,
): Promise<{
  message: string;
}> => {
  return fetchJson(
    `/api/user/notifications/new-count`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body ?? { opened: true }),
    },
    { errorMessage: "User notification opened error" },
  );
};

export const getUserNewNotificationCount = async (): Promise<number> => {
  const data = await fetchJson<{ count: number }>(
    "/api/user/notifications/new-count",
    undefined,
    { errorMessage: "User new notification count fetch error" },
  );

  return data.count;
};

export const userNotificationMarkRead = async ({
  id,
  body,
}: {
  id: string;
  body: UserNotificationMarkReadBody;
}): Promise<{ message: string }> => {
  return fetchJson(
    `/api/user/notifications/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
    { errorMessage: "User notification mark read error" },
  );
};

export const deleteUserNotification = async (id: string) => {
  return fetchJson(
    `/api/user/notifications/${id}`,
    {
      method: "DELETE",
    },
    { errorMessage: "User notification delete error" },
  );
};

// profile
export const getUserLetters = async ({
  username,
  lastId,
}: {
  username: string;
  lastId?: string;
}): Promise<Letter[]> => {
  const searchParams = new URLSearchParams();

  if (lastId) {
    searchParams.append("lastId", lastId);
  }

  return fetchJson<LetterDTO[]>(
    `/api/user/${username}/letters?${searchParams}`,
    undefined,
    {
      errorMessage: "User letters fetch error",
    },
  );
};

export const getUserReplies = async ({
  username,
  lastId,
}: {
  username: string;
  lastId?: string;
}): Promise<UserLetterReply[]> => {
  const searchParams = new URLSearchParams();

  if (lastId) {
    searchParams.append("lastId", lastId);
  }

  return fetchJson<UserLetterReplyDTO[]>(
    `/api/user/${username}/replies?${searchParams}`,
    undefined,
    {
      errorMessage: "Failed to get replies",
    },
  );
};

export const getUserLikedLetters = async ({
  username,
  lastId,
}: {
  username: string;
  lastId?: string;
}): Promise<Letter[]> => {
  const searchParams = new URLSearchParams();

  if (lastId) {
    searchParams.append("lastId", lastId);
  }

  return fetchJson<LetterDTO[]>(
    `/api/user/${username}/likes?${searchParams}`,
    undefined,
    {
      errorMessage: "User liked letters fetch error",
    },
  );
};
