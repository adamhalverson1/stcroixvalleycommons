'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import SignUpForm from '@/components/SignUpForm';

export default function SignUpPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setLoading(false);
        return;
      }

      setUser(firebaseUser);

      const planType = localStorage.getItem('selectedPlan');
      const priceId = localStorage.getItem('selectedPriceId');
      const businessId = localStorage.getItem('businessId');

      if (!planType || !priceId || !businessId) {
        console.error('Missing planType, priceId, or businessId in localStorage');
        setLoading(false);
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
          setLoading(false);
        }
      } catch (err) {
        console.error('Error redirecting to Stripe:', err);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex justify-center py-10 min-h-screen bg-gray-100 p-6">
      <SignUpForm />
    </div>
  );
}
