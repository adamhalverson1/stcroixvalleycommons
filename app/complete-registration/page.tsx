// app/complete-business/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { db, storage } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes } from "firebase/storage";

export default function CompleteRegistrationPage() {
  const { user } = useUser();
  const router = useRouter();
  const [status, setStatus] = useState("Submitting...");

  useEffect(() => {
    const submitData = async () => {
      const storedForm = localStorage.getItem("pendingBusiness");
      const storedImage = localStorage.getItem("pendingBusinessImage");

      if (!user) {
        setStatus("User not signed in.");
        return;
      }

      if (!storedForm) {
        setStatus("No business data found.");
        return;
      }

      const form = JSON.parse(storedForm);

      try {
        const docRef = await addDoc(collection(db, "businesses"), {
          ...form,
          userId: user.id,
          createdAt: serverTimestamp(),
        });

        if (storedImage) {
          const imageBlob = await (await fetch(storedImage)).blob();
          const imageRef = ref(storage, `businesses/${docRef.id}/image.jpg`);
          await uploadBytes(imageRef, imageBlob);
        }

        localStorage.removeItem("pendingBusiness");
        localStorage.removeItem("pendingBusinessImage");

        setStatus("✅ Business successfully registered.");
        router.push("/dashboard");
      } catch (err) {
        console.error(err);
        setStatus("❌ Failed to register business.");
      }
    };

    submitData();
  }, [user, router]);

  return <p className="text-center mt-10">{status}</p>;
}
