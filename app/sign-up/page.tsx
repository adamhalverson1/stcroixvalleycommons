'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, SignUp } from '@clerk/nextjs';
import { db } from '@/lib/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

export default function SignUpPage() {
  const router = useRouter();
  const { isSignedIn, user } = useUser();

  useEffect(() => {
    const saveBusiness = async () => {
      if (isSignedIn && user) {
        const formData = localStorage.getItem('businessForm');
        if (!formData) return;

        const business = JSON.parse(formData);
        try {
          const docRef = await addDoc(collection(db, 'businesses'), {
            ...business,
            createdAt: serverTimestamp(),
            userId: user.id,
            plan: null,
          });

          localStorage.removeItem('businessForm');
          localStorage.setItem('businessId', docRef.id);
          router.push('/select-plan');
        } catch (err) {
          console.error('Error saving business after sign-up:', err);
        }
      }
    };

    saveBusiness();
  }, [isSignedIn, user, router]);

  return (
    <div className="flex justify-center py-10">
      <SignUp afterSignUpUrl="/sign-up" />
    </div>
  );
}
