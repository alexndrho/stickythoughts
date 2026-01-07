interface TurnstileResponse {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  "error-codes": string[];
  action?: string;
  cdata?: string;
  metadata?: {
    ephemeral_id?: string;
  };
}

export const validateTurnstile = async ({
  token,
  secret,
  remoteip,
}: {
  token: string;
  secret: string;
  remoteip?: string;
}): Promise<TurnstileResponse> => {
  try {
    const turnstileResponse = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          secret,
          response: token,
          remoteip,
        }),
      },
    );

    const turnstileResult = await turnstileResponse.json();

    return turnstileResult;
  } catch (error) {
    console.error("Turnstile validation error:", error);
    return { success: false, "error-codes": ["internal-error"] };
  }
};
