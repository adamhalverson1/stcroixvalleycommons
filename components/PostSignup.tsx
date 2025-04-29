'use client';

import { useEffect, useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '@/lib/firebase';

export default function PostSignup() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      const businessData = localStorage.getItem('pendingBusinessData');

      if (user && businessData) {
        try {
          setUserId(user.uid);
          const data = JSON.parse(businessData);
          await addDoc(collection(db, 'businesses'), {
            ...data,
            userId: user.uid,
            createdAt: serverTimestamp(),
          });

          localStorage.removeItem('pendingBusinessData');
          window.location.href = '/dashboard';
        } catch (err) {
          console.error('Error registering business post-signup:', err);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  return <p>Finishing account setup...</p>;
}
