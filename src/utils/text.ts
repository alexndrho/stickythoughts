import { INVISIBLE_AND_FORMATTING, URL_REGEX, WHITESPACE_REGEX } from '@/config/text';
import { censor, matcher } from '@/lib/bad-words';

export const sanitizeString = (text: string) =>
  text.replace(INVISIBLE_AND_FORMATTING, '').replace(WHITESPACE_REGEX, ' ').trim();

export const sanitizeMultilineString = (text: string) =>
  text
    .replace(INVISIBLE_AND_FORMATTING, '')
    .replace(/\r\n?/g, '\n')
    .replace(/[^\S\n]+/g, ' ')
    .replace(/\n+/g, '\n')
    .trim();

export const containsUrl = (text: string) => {
  return URL_REGEX.test(text);
};

export const filterText = (text: string) => {
  const matches = matcher.getAllMatches(text);

  return censor.applyTo(text, matches);
};

export const extractKeyFromUrl = (url: string) => {
  const urlObj = new URL(url);
  return decodeURIComponent(urlObj.pathname.slice(1));
};

export const safeExtractKeyFromUrl = (url: string) => {
  try {
    return extractKeyFromUrl(url);
  } catch {
    return null;
  }
};

// Only allow deleting profile images that are under the expected per-user prefix.
// This prevents a poisoned `user.image` URL from causing arbitrary object deletion.
export const extractUserProfileImageKeyFromUrl = (url: string, userId: string) => {
  const key = safeExtractKeyFromUrl(url);
  if (!key) return null;

  const expectedPrefix = `user/${userId}/profile/`;
  return key.startsWith(expectedPrefix) ? key : null;
};
