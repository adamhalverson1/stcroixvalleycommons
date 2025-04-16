"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function CompleteRegistrationPage() {
  const { user } = useUser();
  const router = useRouter();
  const [status, setStatus] = useState("Submitting...");

  useEffect(() => {
    const submitData = async () => {
      const stored = localStorage.getItem("pendingBusiness");

      if (!user) {
        setStatus("User not signed in.");
        return;
      }

      if (!stored) {
        setStatus("No business data found.");
        return;
      }

      const form = JSON.parse(stored);

      try {
        await addDoc(collection(db, "businesses"), {
          ...form,
          userId: user.id,
          createdAt: serverTimestamp(),
        });

        localStorage.removeItem("pendingBusiness");
        setStatus("✅ Business successfully registered.");
        router.push("/dashboard"); // or wherever you want
      } catch (err) {
        console.error(err);
        setStatus("❌ Failed to register business.");
      }
    };

    submitData();
  }, [user, router]);

  return <p className="text-center mt-10">{status}</p>;
}
