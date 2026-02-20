import { createHash } from 'crypto';

export const getAnonymousLabel = ({
  letterId,
  authorId,
  length = 4,
}: {
  letterId: string;
  authorId: string;
  length?: number;
}) => {
  const hash = createHash('sha256')
    .update(`${letterId}:${authorId}`)
    .digest('hex')
    .slice(0, length)
    .toUpperCase();

  return hash;
};
