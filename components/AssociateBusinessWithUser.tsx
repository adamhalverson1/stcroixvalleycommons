"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useSearchParams, useRouter } from "next/navigation";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function AssociateBusinessWithUser() {
  const { user, isSignedIn } = useUser();
  const searchParams = useSearchParams();
  const router = useRouter();
  const businessId = searchParams.get("businessId");

  useEffect(() => {
    const linkBusiness = async () => {
      if (isSignedIn && businessId) {
        const businessRef = doc(db, "pendingBusinesses", businessId);
        await updateDoc(businessRef, { userId: user.id });
        router.push("/dashboard"); // Or wherever you want to go after linking
      }
    };

    linkBusiness();
  }, [isSignedIn, businessId, user, router]);

  return <p>Linking your business to your account...</p>;
}
