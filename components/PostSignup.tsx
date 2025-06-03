'use client';

import { useEffect, useState } from 'react';
import { collection, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '@/lib/firebase';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

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
          const baseSlug = slugify(data.name);
          let slug = baseSlug;
          let counter = 1;

          // Ensure unique slug
          while ((await getDoc(doc(db, 'businesses', slug))).exists()) {
            slug = `${baseSlug}-${counter++}`;
          }

          await setDoc(doc(db, 'businesses', slug), {
            ...data,
            userId: user.uid,
            slug,
            createdAt: serverTimestamp(),
          });

          localStorage.removeItem('pendingBusinessData');
          window.location.href = `/dashboard/${slug}`;
        } catch (err) {
          console.error('Error registering business post-signup:', err);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  return <p>Finishing account setup...</p>;
}
