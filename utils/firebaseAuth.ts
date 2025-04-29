// utils/firebaseAuth.ts
import { firebaseAuth } from "@/lib/firebase";
import { useAuth } from "@clerk/nextjs";
import { signInWithCustomToken } from "firebase/auth";

export async function signInToFirebase() {
  const { getToken } = useAuth();
  const token = await getToken({ template: "firebase" });

  if (!token) throw new Error("No Clerk token available.");

  await signInWithCustomToken(firebaseAuth, token);
}
