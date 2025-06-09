'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import SignUpForm from '@/components/SignUpForm';

export default function SignUpPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) return;

      setUser(firebaseUser);

      const planType = localStorage.getItem('selectedPlan');
      const businessId = localStorage.getItem('businessId');
      const priceId =
        planType === 'featured'
          ? 'price_1REuzvKabuDj6Ug30bfZ2sDL'
          : 'price_1REuzXKabuDj6Ug3So8O4OSY';

      if (!planType || !businessId) {
        console.error('Missing planType or businessId in localStorage');
        return;
      }

      try {
        const res = await fetch('/api/checkout-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ businessId, priceId, plan: planType }),
        });

        const data = await res.json();
        if (data?.url) {
          window.location.href = data.url;
        } else {
          console.error('Stripe session creation failed:', data);
        }
      } catch (err) {
        console.error('Error redirecting to Stripe:', err);
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
