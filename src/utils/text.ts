import { urlRegex } from "@/config/text";
import { filter } from "@/lib/bad-words";

export const containsUrl = (text: string) => {
  return urlRegex.test(text);
};

export const apiUrl = (path: string) => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  if (!baseUrl) {
    throw new Error("API base URL is not defined");
  }

  return `${baseUrl}${path}`;
};

export const filterText = (text: string) => {
  try {
    return filter.clean(text);
  } catch (error) {
    console.error(error);
    return text;
  }
};

export const extractKeyFromUrl = (url: string) => {
  const urlObj = new URL(url);
  return decodeURIComponent(urlObj.pathname.slice(1));
};

export const stripHtmlTags = (text: string) => {
  // Replace <p> and </p> tags with a space or newline
  const sanitizedText = text.replace(/<\/?p>/g, " ");
  const doc = new DOMParser().parseFromString(sanitizedText, "text/html");
  return doc.body.textContent?.trim() || "";
};
