import type IError from '@/types/error';

export default class ServerError extends Error {
  issues: IError['issues'];

  constructor(message: string, issues: IError['issues']) {
    super(message);
    this.name = 'ServerError';
    this.issues = issues;

    Object.setPrototypeOf(this, ServerError.prototype);
  }
}

export function toServerError(message: string, issues: IError['issues']): ServerError {
  return new ServerError(message, issues);
}
