import { z } from "zod";
import sanitizeHtml, { type IOptions } from "sanitize-html";
import * as cheerio from "cheerio";

import { sanitizeString } from "@/utils/text";

export const LETTER_TITLE_MIN_LENGTH = 1;
export const LETTER_TITLE_MAX_LENGTH = 100;
export const LETTER_BODY_MIN_LENGTH = 1;
export const LETTER_BODY_MAX_LENGTH = 20000;

export const LETTER_REPLY_MAX_LENGTH = 7500;

const sanitizeBodyHtmlOptions: IOptions = {
  allowedTags: [
    "p",
    // "h1",
    "h2",
    "strong",
    "em",
    "s",
    "ul",
    "ol",
    "li",
    "blockquote",
    "code",
    "pre",
    "a",
  ],
  allowedAttributes: {
    a: ["href", "target", "rel"],
  },
  allowedSchemes: ["http", "https", "mailto"],
  transformTags: {
    a: sanitizeHtml.simpleTransform("a", {
      target: "_blank",
      rel: "noopener noreferrer",
    }),
  },
  selfClosing: ["hr"],
  // allowedStyles: {
  //   "*": {
  //     "text-align": [/^left$/, /^right$/, /^center$/, /^justify$/],
  //     color: [/^#[0-9a-fA-F]{3,6}$/, /^rgb\(/],
  //     "background-color": [/^#[0-9a-fA-F]{3,6}$/, /^rgb\(/],
  //   },
  // },
  parser: {
    lowerCaseTags: true,
  },
  exclusiveFilter: (frame) => {
    // Preserve self-closing tags like <br> and <hr>
    const selfClosingTags = ["hr"];
    if (frame.tag && selfClosingTags.includes(frame.tag)) {
      return false;
    }
    // Remove tags that have no text or only whitespace
    return !frame.text || !frame.text.trim();
  },
} as const;

export const createLetterServerInput = z.object({
  title: z
    .string("Title is required")
    .transform(sanitizeString)
    .pipe(
      z
        .string()
        .min(LETTER_TITLE_MIN_LENGTH, "Title is required")
        .max(
          LETTER_TITLE_MAX_LENGTH,
          `Title must be at most ${LETTER_TITLE_MAX_LENGTH.toLocaleString()} characters long`,
        ),
    ),
  body: z
    .string("Body is required")
    .transform(sanitizeString)
    .pipe(
      z
        .string()
        .min(LETTER_BODY_MIN_LENGTH, "Body is required")
        .max(
          LETTER_BODY_MAX_LENGTH,
          `Body must be at most ${LETTER_BODY_MAX_LENGTH.toLocaleString()} characters, including formatting and spaces.`,
        ),
    )
    .transform((value) => {
      return sanitizeHtml(sanitizeString(value), sanitizeBodyHtmlOptions);
    })
    .superRefine((value, ctx) => {
      const $ = cheerio.load(value);
      const text = $.text().trim();

      if (text.length < LETTER_BODY_MIN_LENGTH) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Body is required",
        });
      }
    }),
  isAnonymous: z.boolean().optional(),
});

export const updateLetterServerInput = createLetterServerInput.pick({
  body: true,
});

export const createLetterReplyServerInput = z.object({
  body: z
    .string("Reply is required")
    .transform(sanitizeString)
    .pipe(
      z
        .string()
        .min(LETTER_BODY_MIN_LENGTH, "Reply is required")
        .max(
          LETTER_REPLY_MAX_LENGTH,
          `Reply must be at most ${LETTER_REPLY_MAX_LENGTH.toLocaleString()} characters long`,
        )
        .transform((value) => {
          return sanitizeHtml(value, sanitizeBodyHtmlOptions);
        })
        .superRefine((value, ctx) => {
          const $ = cheerio.load(value);
          const text = $.text().trim();

          if (text.length < LETTER_BODY_MIN_LENGTH) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Reply is required",
            });
          }
        }),
    ),
  isAnonymous: z.boolean().optional(),
});

export const updateLetterReplyServerInput =
  createLetterReplyServerInput.pick({
    body: true,
  });
