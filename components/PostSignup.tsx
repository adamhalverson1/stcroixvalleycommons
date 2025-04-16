"use client";
import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function PostSignup() {
  const { user } = useUser();

  useEffect(() => {
    const registerBusiness = async () => {
      const businessData = localStorage.getItem("pendingBusinessData");

      if (user && businessData) {
        try {
          const data = JSON.parse(businessData);
          await addDoc(collection(db, "businesses"), {
            ...data,
            userId: user.id,
            createdAt: serverTimestamp(),
          });

          localStorage.removeItem("pendingBusinessData");
          window.location.href = "/dashboard"; // or wherever you want
        } catch (err) {
          console.error("Error registering business post-signup:", err);
        }
      }
    };

    registerBusiness();
  }, [user]);

  return <p>Finishing account setup...</p>;
}
