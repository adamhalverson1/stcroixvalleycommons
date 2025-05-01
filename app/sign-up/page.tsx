'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { db, storage } from '@/lib/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import SignUpForm from '@/components/SignUpForm';

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
          let imageUrl = null;

          // 1. Upload image to Firebase Storage (if exists)
          if (imageDataUrl) {
            const storageRef = ref(storage, `businessImages/${firebaseUser.uid}_${Date.now()}.jpg`);
            await uploadString(storageRef, imageDataUrl, 'data_url');
            imageUrl = await getDownloadURL(storageRef);
          }

          // 2. Add business to Firestore
          const docRef = await addDoc(collection(db, 'businesses'), {
            ...business,
            createdAt: serverTimestamp(),
            userId: firebaseUser.uid,
            imageUrl,
            plan: planType || null,
          });

          // 3. Clean up localStorage and redirect
          localStorage.removeItem('pendingBusiness');
          localStorage.removeItem('pendingBusinessImage');
          localStorage.removeItem('selectedPlan');
          localStorage.setItem('businessId', docRef.id);
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
