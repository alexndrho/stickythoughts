export type systemCode = "ratelimit/exceeded" | "unknown-error" | "not-found";

export type authCode = "auth/unauthorized" | "auth/forbidden";

export type validationCode =
  | "validation/unique-constraint"
  | "validation/invalid-request"
  | "validation/invalid-input"
  | "validation/too-large";

export type threadCode = "thread/title-already-exists";

export type antiBotCode =
  | "captcha/validation-failed"
  | "botid/validation-failed";

export type errorCode =
  | systemCode
  | authCode
  | validationCode
  | threadCode
  | antiBotCode;

export default interface IError {
  issues: {
    code: errorCode;
    message: string;
  }[];
}
