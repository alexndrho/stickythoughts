export type systemCode = "unknown-error" | "not-found";

export type authCode = "auth/unauthorized" | "auth/forbidden";

export type validationCode =
  | "validation/unique-constraint"
  | "validation/invalid-input"
  | "validation/too-large";

export type threadCode = "thread/title-already-exists";

export type captchaCode = "captcha/validation-failed";

export type errorCode =
  | systemCode
  | authCode
  | validationCode
  | threadCode
  | captchaCode;

export default interface IError {
  issues: {
    code: errorCode;
    message: string;
  }[];
}
