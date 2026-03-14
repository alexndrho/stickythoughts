import { jsonError } from '@/lib/http/api-responses';

export function verifyCronRequest(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return jsonError(
      [{ code: 'config/missing-cron-secret', message: 'CRON_SECRET is not configured' }],
      500,
    );
  }

  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${cronSecret}`) {
    return jsonError([{ code: 'auth/unauthorized', message: 'Unauthorized' }], 401);
  }

  return null;
}
