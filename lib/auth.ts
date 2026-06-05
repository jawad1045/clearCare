import { cookies } from "next/headers";


export async function getCurrentUser() {
  const cookieStore = await cookies();

  const token =
    cookieStore.get(
      "session_token"
    )?.value;

  if (!token) return null;

  const [userId, role] =
    token.split("_");

  return {
    id: Number(userId),
    role,
  };
}