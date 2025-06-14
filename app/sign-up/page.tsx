'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import SignUpForm from '@/components/SignUpForm';

export default function SignUpPage() {
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push('/dashboard');
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
