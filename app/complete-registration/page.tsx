'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, getAuth } from 'firebase/auth';
import { db, storage } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function CompleteRegistrationPage() {
  const router = useRouter();
  const [status, setStatus] = useState('Submitting...');
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setStatus('User not signed in.');
        return;
      }

      setUserId(user.uid);

      const storedForm = localStorage.getItem('pendingBusiness');
      const storedImage = localStorage.getItem('pendingBusinessImage');

      if (!storedForm) {
        setStatus('No business data found.');
        return;
      }

      const form = JSON.parse(storedForm);
      const baseSlug = slugify(form.name);
      let slug = baseSlug;
      let counter = 1;

      // Ensure the slug is unique in Firestore
      while ((await getDoc(doc(db, 'businesses', slug))).exists()) {
        slug = `${baseSlug}-${counter++}`;
      }

      try {
        let imageUrl = '';

        if (storedImage) {
          const imageBlob = await (await fetch(storedImage)).blob();
          const imageRef = ref(storage, `businesses/${slug}/image.jpg`);
          await uploadBytes(imageRef, imageBlob);
          imageUrl = await getDownloadURL(imageRef);
        }

        await setDoc(doc(db, 'businesses', slug), {
          ...form,
          slug,
          userId: user.uid,
          image: imageUrl,
          createdAt: serverTimestamp(),
        });

        localStorage.removeItem('pendingBusiness');
        localStorage.removeItem('pendingBusinessImage');

        setStatus('✅ Business successfully registered.');
        router.push(`/businesses/${slug}`);
      } catch (error) {
        console.error(error);
        setStatus('❌ Failed to register business.');
      }
    });

    return () => unsubscribe();
  }, [router]);

  return <p className="text-center mt-10">{status}</p>;
}
