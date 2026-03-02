export const userKeys = {
  all: () => ['user'] as const,
  byUsername: (username: string) => [...userKeys.all(), username] as const,

  account: () => [...userKeys.all(), 'account'] as const,
  accountList: () => [...userKeys.all(), 'account-list'] as const,
  privacy: () => [...userKeys.all(), 'privacy'] as const,
  sessions: () => [...userKeys.all(), 'sessions'] as const,

  notificationSettings: () => [...userKeys.all(), 'notification-settings'] as const,
  notifications: () => [...userKeys.all(), 'notifications'] as const,
  notificationsInfinite: () => [...userKeys.notifications(), 'infiniteNotifications'] as const,
  notificationCount: () => [...userKeys.notifications(), 'count'] as const,
  infiniteLetters: (username: string) =>
    [...userKeys.byUsername(username), 'infiniteLetters'] as const,
  infiniteReplies: (username: string) =>
    [...userKeys.byUsername(username), 'infiniteReplies'] as const,
  infiniteLikes: (username: string) => [...userKeys.byUsername(username), 'infiniteLikes'] as const,
};
