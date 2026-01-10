import { z } from "zod";
import sanitizeHtml, { type IOptions } from "sanitize-html";
import * as cheerio from "cheerio";

export const THREAD_TITLE_MIN_LENGTH = 1;
export const THREAD_TITLE_MAX_LENGTH = 100;
export const THREAD_BODY_MIN_LENGTH = 1;
export const THREAD_BODY_MAX_LENGTH = 20000;

export const THREAD_COMMENT_MAX_LENGTH = 7500;

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

export const createThreadServerInput = z.object({
  title: z
    .string("Title is required")
    .trim()
    .min(THREAD_TITLE_MIN_LENGTH, "Title is required")
    .max(
      THREAD_TITLE_MAX_LENGTH,
      `Title must be at most ${THREAD_TITLE_MAX_LENGTH.toLocaleString()} characters long`,
    ),
  body: z
    .string("Body is required")
    .trim()
    .min(THREAD_BODY_MIN_LENGTH, "Body is required")
    .max(
      THREAD_BODY_MAX_LENGTH,
      `Body must be at most ${THREAD_BODY_MAX_LENGTH.toLocaleString()} characters, including formatting and spaces.`,
    )
    .transform((value) => {
      return sanitizeHtml(value, sanitizeBodyHtmlOptions);
    })
    .superRefine((value, ctx) => {
      const $ = cheerio.load(value);
      const text = $.text().trim();

      if (text.length < THREAD_BODY_MIN_LENGTH) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Body is required",
        });
      }
    }),
  isAnonymous: z.boolean().optional(),
});

export const updateThreadServerInput = createThreadServerInput.pick({
  body: true,
});

export const createThreadCommentServerInput = z.object({
  body: z
    .string("Comment is required")
    .trim()
    .min(THREAD_BODY_MIN_LENGTH, "Comment is required")
    .max(
      THREAD_COMMENT_MAX_LENGTH,
      `Comment must be at most ${THREAD_COMMENT_MAX_LENGTH.toLocaleString()} characters long`,
    )
    .transform((value) => {
      return sanitizeHtml(value, sanitizeBodyHtmlOptions);
    })
    .superRefine((value, ctx) => {
      const $ = cheerio.load(value);
      const text = $.text().trim();

      if (text.length < THREAD_BODY_MIN_LENGTH) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Comment is required",
        });
      }
    }),
  isAnonymous: z.boolean().optional(),
});

export const updateThreadCommentServerInput =
  createThreadCommentServerInput.pick({
    body: true,
  });
