import { cookies } from "next/headers";
import crypto from "crypto";

export const SESSION_COOKIE_NAME = "session_token";
export const DEFAULT_SESSION_TIMEOUT_MINUTES = 60 * 24;

function getSessionSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET environment variable is required.");
  }
  return secret;
}

function signValue(value: string) {
  const secret = getSessionSecret();
  return crypto
    .createHmac("sha256", secret)
    .update(value)
    .digest("base64url");
}

function createSessionToken(userId: number, role: string, expiresAt: number) {
  const payload = Buffer.from(`${userId}:${role}:${expiresAt}`, "utf8").toString("base64url");
  return `${payload}.${signValue(payload)}`;
}

export function verifySessionToken(token: string) {
  const [payload, signature] = token.split(".");
  if (!payload || !signature) {
    return null;
  }

  const expectedSignature = signValue(payload);
  const signatureBuffer = Buffer.from(signature, "utf8");
  const expectedBuffer = Buffer.from(expectedSignature, "utf8");

  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    return null;
  }

  const decoded = Buffer.from(payload, "base64url").toString("utf8");
  const [id, role, expiresAtRaw] = decoded.split(":");
  const userId = Number(id);
  const expiresAt = Number(expiresAtRaw);

  if (!Number.isInteger(userId) || !role || !Number.isFinite(expiresAt)) {
    return null;
  }

  // Session has timed out — caller must require the user to log in again.
  if (Date.now() > expiresAt) {
    return null;
  }

  return {
    id: userId,
    role,
  };
}

export async function setSessionCookie(
  user: { id: number; role: string },
  timeoutMinutes: number = DEFAULT_SESSION_TIMEOUT_MINUTES
) {
  const cookieStore = await cookies();
  const expiresAt = Date.now() + timeoutMinutes * 60 * 1000;
  const token = createSessionToken(user.id, user.role, expiresAt);
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: timeoutMinutes * 60,
    path: "/",
  });
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return null;
  }
  return verifySessionToken(token);
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0,
    path: "/",
  });
}
