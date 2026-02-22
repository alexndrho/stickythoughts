export function getLetterFromDisplay({
  anonymousFrom,
  authorName,
  authorUsername,
}: {
  anonymousFrom?: string | null;
  authorName?: string | null;
  authorUsername?: string | null;
}) {
  const normalizedAnonymousFrom = anonymousFrom?.trim();
  const normalizedAuthorName = authorName?.trim();
  const normalizedAuthorUsername = authorUsername?.trim();

  if (normalizedAnonymousFrom) {
    return {
      displayName: normalizedAnonymousFrom,
      isAnonymous: true,
    };
  }

  return {
    displayName:
      normalizedAuthorName ||
      (normalizedAuthorUsername ? `@${normalizedAuthorUsername}` : 'Anonymous'),
    isAnonymous: false,
  };
}
