import 'server-only';

export class LetterNotFoundError extends Error {
  name = 'LetterNotFoundError';
}

export class ReplyNotFoundError extends Error {
  name = 'ReplyNotFoundError';
}
