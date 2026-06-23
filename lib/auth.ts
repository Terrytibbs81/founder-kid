import { kvGet, kvSet } from "./kv";

function generateToken(length = 32): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function emailToUserId(email: string): string {
  return Buffer.from(email.toLowerCase().trim()).toString("base64url");
}

export async function createMagicToken(email: string): Promise<string> {
  const token = generateToken(32);
  await kvSet(`magictoken:${token}`, {
    email,
    expires: Date.now() + 15 * 60 * 1000,
  });
  return token;
}

export async function verifyMagicToken(token: string): Promise<string | null> {
  const data = await kvGet(`magictoken:${token}`);
  if (!data) return null;
  if (Date.now() > data.expires) return null;
  return data.email;
}

export async function createSession(email: string): Promise<string> {
  const sessionToken = generateToken(48);
  const userId = emailToUserId(email);
  await kvSet(`session:${sessionToken}`, {
    email,
    userId,
    createdAt: Date.now(),
  });
  return sessionToken;
}

export async function getSessionFromRequest(
  request: Request
): Promise<{ email: string; userId: string } | null> {
  const cookieHeader = request.headers.get("cookie") || "";
  const match = cookieHeader.match(/(?:^|;\s*)session=([^;]+)/);
  if (!match) return null;
  const sessionToken = decodeURIComponent(match[1]);
  const session = await kvGet(`session:${sessionToken}`);
  return session || null;
}

export async function deleteSession(request: Request): Promise<void> {
  const cookieHeader = request.headers.get("cookie") || "";
  const match = cookieHeader.match(/(?:^|;\s*)session=([^;]+)/);
  if (!match) return;
  const sessionToken = decodeURIComponent(match[1]);
  await kvSet(`session:${sessionToken}`, null);
}
