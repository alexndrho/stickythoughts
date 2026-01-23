export const USERNAME_REGEX = /^[a-zA-Z0-9](?!.*--)[a-zA-Z0-9-]*[a-zA-Z0-9]$/;

export const WHITESPACE_REGEX = /\s+/g;

export const INVISIBLE_CHARS_REGEX =
  /[\u200B-\u200D\uFEFF\u200E\u200F\u2060-\u206F\u3164\u115F\u1160\u2800]/g;

export const URL_REGEX =
  /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=+$,\w]+@)?[A-Za-z0-9.-]+|(?:www\.|[-;:&=+$,\w]+@)[A-Za-z0-9.-]+)((?:\/[+~%/.\w\-_]*)?\??(?:[-+=&;%@.\w_]*)#?(?:[.!/\\\w]*))?)/gi;
