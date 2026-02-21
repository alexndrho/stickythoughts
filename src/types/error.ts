export type systemCode =
  | 'ratelimit/exceeded'
  | 'unknown-error'
  | 'not-found'
  | 'config/missing-cron-secret';

export type authCode = 'auth/unauthorized' | 'auth/forbidden';

export type validationCode =
  | 'validation/unique-constraint'
  | 'validation/invalid-request'
  | 'validation/invalid-input'
  | 'validation/too-large';

export type thoughtCode = 'thought/highlight-locked';

export type antiBotCode = 'captcha/validation-failed' | 'botid/validation-failed';

export type errorCode = systemCode | authCode | validationCode | thoughtCode | antiBotCode;

export default interface IError {
  issues: {
    code: errorCode;
    message: string;
  }[];
}
