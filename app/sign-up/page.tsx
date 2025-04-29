'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import SignUpForm from '@/components/SignUpForm'; // You need to create this

export default function SignUpPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser && !user) {
        setUser(firebaseUser);
        const formData = localStorage.getItem('businessForm');
  
        if (!formData) {
          console.warn('No businessForm data found');
          return;
        }
  
        try {
          const business = JSON.parse(formData);
          const docRef = await addDoc(collection(db, 'businesses'), {
            ...business,
            createdAt: serverTimestamp(),
            userId: firebaseUser.uid,
            plan: null,
          });
  
          localStorage.removeItem('businessForm');
          localStorage.setItem('businessId', docRef.id);
          router.push('/select-plan');
        } catch (err) {
          console.error('Error saving business after sign-up:', err);
        }
      }
    });
  
    return () => unsubscribe();
  }, [router, user]);

  return (
    <div className="flex justify-center py-10">
      <SignUpForm />
    </div>
  );
}
