/**
 * Cloudflare Turnstile server-side verification.
 * Verifies CAPTCHA tokens by calling the Turnstile siteverify API.
 * Bypasses in dev if TURNSTILE_SECRET_KEY is not set.
 */

const TURNSTILE_VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

interface TurnstileVerifyResponse {
  success: boolean;
  "error-codes"?: string[];
  challenge_ts?: string;
  hostname?: string;
}

/**
 * Verify a Turnstile token server-side.
 * Returns true if the token is valid, false otherwise.
 * Fails closed: network errors → rejection.
 * Bypasses if TURNSTILE_SECRET_KEY is not configured (dev mode).
 */
export async function verifyTurnstileToken(
  token: string | null | undefined,
  remoteip?: string
): Promise<boolean> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  // Dev bypass: if secret key not configured, allow all requests
  if (!secretKey) {
    return true;
  }

  if (!token) {
    return false;
  }

  try {
    const formData = new URLSearchParams();
    formData.append("secret", secretKey);
    formData.append("response", token);
    if (remoteip) {
      formData.append("remoteip", remoteip);
    }

    const res = await fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString(),
    });

    if (!res.ok) {
      console.error("[Turnstile] HTTP error:", res.status);
      return false; // Fail closed
    }

    const data: TurnstileVerifyResponse = await res.json();

    if (!data.success) {
      console.warn(
        "[Turnstile] Verification failed:",
        data["error-codes"]?.join(", ")
      );
    }

    return data.success;
  } catch (err) {
    console.error("[Turnstile] Network error:", err);
    return false; // Fail closed
  }
}
