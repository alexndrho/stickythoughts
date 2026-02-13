import {
  INVISIBLE_AND_FORMATTING,
  URL_REGEX,
  WHITESPACE_REGEX,
} from "@/config/text";
import { censor, matcher } from "@/lib/bad-words";

export const sanitizeString = (text: string) =>
  text
    .replace(INVISIBLE_AND_FORMATTING, "")
    .replace(WHITESPACE_REGEX, " ")
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
export const extractUserProfileImageKeyFromUrl = (
  url: string,
  userId: string,
) => {
  const key = safeExtractKeyFromUrl(url);
  if (!key) return null;

  const expectedPrefix = `user/${userId}/profile/`;
  return key.startsWith(expectedPrefix) ? key : null;
};

export const stripHtmlTags = (text: string) => {
  // Keep paragraph-like separators readable before stripping tags.
  const sanitizedText = text.replace(/<\/?p>/gi, " ");

  if (typeof DOMParser !== "undefined") {
    const doc = new DOMParser().parseFromString(sanitizedText, "text/html");
    return doc.body.textContent?.trim() || "";
  }

  // Prefer cheerio on server for more reliable HTML text extraction.
  if (typeof window === "undefined") {
    try {
      // In ESM server bundles, `require` may not be directly in scope.
      const nodeRequire = (0, eval)("require") as NodeJS.Require;
      const { load } = nodeRequire("cheerio") as typeof import("cheerio");
      return load(sanitizedText).text().trim();
    } catch {
      // Fall through to lightweight regex fallback.
    }
  }
  // Server/runtime fallback (Node): strip tags without browser DOM APIs.
  return sanitizedText
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
};
