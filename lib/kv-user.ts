import { kvGet, kvSet } from "./kv";

export function userKey(userId: string, key: string): string {
  return `user:${userId}:${key}`;
}

export async function userGet(userId: string, key: string) {
  return kvGet(userKey(userId, key));
}

export async function userSet(userId: string, key: string, value: unknown) {
  return kvSet(userKey(userId, key), value);
}

export async function registerUser(userId: string): Promise<void> {
  const users: string[] = (await kvGet("users")) || [];
  if (!users.includes(userId)) {
    users.push(userId);
    await kvSet("users", users);
  }
}

export async function getAllUsers(): Promise<string[]> {
  return (await kvGet("users")) || [];
}
