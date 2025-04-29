'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

export default function AssociateBusinessWithUser() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const businessId = searchParams.get('businessId');

  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && businessId) {
        setUserId(user.uid);
        try {
          const businessRef = doc(db, 'pendingBusinesses', businessId);
          await updateDoc(businessRef, { userId: user.uid });
          router.push('/dashboard');
        } catch (err) {
          console.error('Failed to associate business with user:', err);
        }
      }
    });

    return () => unsubscribe();
  }, [businessId, router]);

  return <p>Linking your business to your account...</p>;
}
