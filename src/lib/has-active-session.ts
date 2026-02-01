import { auth } from "@/lib/auth";

export const hasActiveSession = async (
  userId: string,
  now: Date,
): Promise<{
  hasActiveSession: boolean;
  error?: unknown;
}> => {
  try {
    const { internalAdapter } = await auth.$context;
    const sessions = await internalAdapter.listSessions(userId);
    return {
      hasActiveSession: sessions.some((session) => session.expiresAt > now),
    };
  } catch (error) {
    console.error("Failed to check active sessions for user:", userId, error);
    return { hasActiveSession: true, error };
  }
};
