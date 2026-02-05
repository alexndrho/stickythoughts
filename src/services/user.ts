import { toServerError } from "@/utils/error/ServerError";
import { apiUrl } from "@/utils/text";
import type {
  UserNotificationType,
  UserAccountSettings,
  UserPublicAccount,
  UserSettingsPrivacy,
} from "@/types/user";
import { VisibilityLevel } from "@/generated/prisma/enums";
import type { LetterType, UserLetterReplyType } from "@/types/letter";

export const getUser = async (
  username: string,
  cookie?: string,
): Promise<UserPublicAccount> => {
  const res = await fetch(apiUrl(`/api/user/${username}`), {
    headers: {
      ...(cookie ? { cookie } : {}),
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw toServerError("User fetch error", data.issues);
  }

  return data;
};

export const getUserAccountSettings =
  async (): Promise<UserAccountSettings> => {
    const res = await fetch(apiUrl("/api/user/settings"));

    const data = await res.json();

    if (!res.ok) {
      throw toServerError("User profile fetch error", data.issues);
    }

    return data;
  };

export const updateUserBio = async (bio: string): Promise<{ bio: string }> => {
  const res = await fetch(apiUrl("/api/user/bio"), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ bio }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw toServerError("User bio update error", data.issues);
  }

  return data;
};

// allows admins to delete a user's bio. note: users can clear their own bio by setting it to an empty string.
export const deleteUserBio = async (
  id: string,
): Promise<{ message: string }> => {
  const searchParams = new URLSearchParams();
  searchParams.append("id", id);

  return await fetch(apiUrl(`/api/user/bio?${searchParams.toString()}`), {
    method: "DELETE",
  }).then(async (res) => {
    const data = await res.json();

    if (!res.ok) {
      throw toServerError("User bio delete error", data.issues);
    }

    return data;
  });
};

export const uploadProfilePicture = async (
  formData: FormData,
): Promise<{ image: string }> => {
  const res = await fetch(apiUrl("/api/user/profile-picture"), {
    method: "PUT",
    body: formData,
  });

  const data = await res.json();

  if (!res.ok) {
    throw toServerError("Profile picture upload error", data.issues);
  }

  return data;
};

export const removeProfilePicture = async ({
  userId,
  cookie,
}: { userId?: string; cookie?: string } = {}): Promise<{ message: string }> => {
  const searchParams = new URLSearchParams();
  if (userId) {
    searchParams.append("userId", userId);
  }

  const res = await fetch(
    apiUrl(`/api/user/profile-picture?${searchParams.toString()}`),
    {
      method: "DELETE",
      headers: {
        ...(cookie ? { cookie } : {}),
      },
    },
  );

  const data = await res.json();

  if (!res.ok) {
    throw toServerError("Profile picture delete error", data.issues);
  }

  return data;
};

export const getUserSettingsPrivacy =
  async (): Promise<UserSettingsPrivacy> => {
    const res = await fetch(apiUrl("/api/user/settings/privacy"));

    const data = await res.json();

    if (!res.ok) {
      throw toServerError("User settings privacy fetch error", data.issues);
    }

    return data;
  };

export const updateUserLikesVisibility = async (
  visibility: VisibilityLevel,
): Promise<UserSettingsPrivacy> => {
  const res = await fetch(
    apiUrl("/api/user/settings/privacy/likes-visibility"),
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ visibility }),
    },
  );

  const data = await res.json();

  if (!res.ok) {
    throw toServerError("User likes visibility update error", data.issues);
  }

  return data;
};

export const getUserNotifications = async (
  lastUpdatedAt?: string,
): Promise<UserNotificationType[]> => {
  const searchParams = new URLSearchParams();

  if (lastUpdatedAt) {
    searchParams.append("lastUpdatedAt", lastUpdatedAt);
  }

  const res = await fetch(
    apiUrl(`/api/user/notifications?${searchParams.toString()}`),
  );

  const data = await res.json();

  if (!res.ok) {
    throw toServerError("User notifications fetch error", data.issues);
  }

  return data;
};

export const userNotificationOpened = async (): Promise<{
  message: string;
}> => {
  const res = await fetch(apiUrl(`/api/user/notifications/new-count`), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ opened: true }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw toServerError("User notification opened error", data.issues);
  }

  return data;
};

export const getUserNewNotificationCount = async (): Promise<number> => {
  const res = await fetch(apiUrl("/api/user/notifications/new-count"));

  const data = await res.json();

  if (!res.ok) {
    throw toServerError("User new notification count fetch error", data.issues);
  }

  return data.count;
};

export const userNotificationMarkRead = async ({
  id,
  isRead,
}: {
  id: string;
  isRead: boolean;
}): Promise<{ message: string }> => {
  const res = await fetch(apiUrl(`/api/user/notifications/${id}`), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ isRead }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw toServerError("User notification mark read error", data.issues);
  }

  return data;
};

export const deleteUserNotification = async (id: string) => {
  const res = await fetch(apiUrl(`/api/user/notifications/${id}`), {
    method: "DELETE",
  });

  const data = await res.json();

  if (!res.ok) {
    throw toServerError("User notification delete error", data.issues);
  }

  return data;
};

// profile
export const getUserLetters = async ({
  username,
  lastId,
}: {
  username: string;
  lastId?: string;
}): Promise<LetterType[]> => {
  const searchParams = new URLSearchParams();

  if (lastId) {
    searchParams.append("lastId", lastId);
  }

  const res = await fetch(
    apiUrl(`/api/user/${username}/letters?${searchParams}`),
  );

  const data = await res.json();

  if (!res.ok) {
    throw toServerError("User letters fetch error", data.issues);
  }

  return data;
};

export const getUserReplies = async ({
  username,
  lastId,
}: {
  username: string;
  lastId?: string;
}): Promise<UserLetterReplyType[]> => {
  const searchParams = new URLSearchParams();

  if (lastId) {
    searchParams.append("lastId", lastId);
  }

  const response = await fetch(
    apiUrl(`/api/user/${username}/replies?${searchParams}`),
  );

  const dataResponse = await response.json();

  if (!response.ok) {
    throw toServerError("Failed to get replies", dataResponse.issues);
  }

  return dataResponse;
};

export const getUserLikedLetters = async ({
  username,
  lastId,
}: {
  username: string;
  lastId?: string;
}): Promise<LetterType[]> => {
  const searchParams = new URLSearchParams();

  if (lastId) {
    searchParams.append("lastId", lastId);
  }

  const res = await fetch(
    apiUrl(`/api/user/${username}/likes?${searchParams}`),
  );

  const data = await res.json();

  if (!res.ok) {
    throw toServerError("User liked letters fetch error", data.issues);
  }

  return data;
};
