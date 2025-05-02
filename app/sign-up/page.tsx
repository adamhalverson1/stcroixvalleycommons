'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { db, storage } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import SignUpForm from '@/components/SignUpForm';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function SignUpPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);

        const formData = localStorage.getItem('pendingBusiness');
        const imageDataUrl = localStorage.getItem('pendingBusinessImage');
        const planType = localStorage.getItem('selectedPlan');

        if (!formData) return;

        const business = JSON.parse(formData);

        try {
          // 1. Slugify and ensure uniqueness
          const baseSlug = slugify(business.name);
          let slug = baseSlug;
          let counter = 1;
          while ((await getDoc(doc(db, 'businesses', slug))).exists()) {
            slug = `${baseSlug}-${counter++}`;
          }

          let imageUrl = null;

          // 2. Upload image to Firebase Storage (if exists)
          if (imageDataUrl) {
            const storageRef = ref(storage, `businesses/${slug}/image.jpg`);
            await uploadString(storageRef, imageDataUrl, 'data_url');
            imageUrl = await getDownloadURL(storageRef);
          }

          // 3. Save business to Firestore using the slug as document ID
          await setDoc(doc(db, 'businesses', slug), {
            ...business,
            createdAt: serverTimestamp(),
            userId: firebaseUser.uid,
            image: imageUrl,
            slug,
            plan: planType || null,
          });

          // 4. Clean up localStorage and redirect
          localStorage.removeItem('pendingBusiness');
          localStorage.removeItem('pendingBusinessImage');
          localStorage.removeItem('selectedPlan');
          localStorage.setItem('businessId', slug); // Save slug, not random ID

          router.push('/select-plan');
        } catch (err) {
          console.error('Error saving business after sign-up:', err);
        }
      }
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <div className="flex justify-center py-10 min-h-screen bg-gray-100 p-6">
      <SignUpForm />
    </div>
  );
}
