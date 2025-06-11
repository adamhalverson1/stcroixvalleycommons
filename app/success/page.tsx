'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function SuccessClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState('');

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (!sessionId) {
      console.error('Missing session_id in URL');
      setError('Missing session ID');
      return;
    }

    const confirmPayment = async () => {
      try {
        const res = await fetch(`/api/check-subscription?session_id=${sessionId}`);
        const data = await res.json();

        if (!res.ok) {
          console.error('❌ Subscription check failed:', data?.error || data);
          setError('Failed to verify subscription.');
        } else {
          console.log('✅ Subscription verified:', data);
          router.push('/dashboard');
        }
      } catch (err) {
        console.error('❌ Error confirming subscription:', err);
        setError('Something went wrong. Try again.');
      }
    };

    confirmPayment();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white shadow-xl rounded-2xl p-8 text-center space-y-4">
        <h1 className="text-2xl font-semibold text-green-700">🎉 Business Registered!</h1>
        <p className="text-gray-700">
          You've successfully registered your business with <strong>St. Croix Commons</strong>.
        </p>
        {error ? (
          <p className="text-red-600 text-sm">{error}</p>
        ) : (
          <p className="text-gray-600 text-sm">Verifying your subscription and redirecting to dashboard...</p>
        )}
        <div className="w-full h-1 bg-gray-200 rounded overflow-hidden">
          <div className="h-full bg-green-500 animate-pulse transition-all duration-3000"></div>
        </div>
        {error && (
          <button
            onClick={() => router.push('/dashboard')}
            className="mt-4 px-6 py-2 rounded bg-green-600 text-white hover:bg-green-700 transition"
          >
            Go to Dashboard
          </button>
        )}
      </div>
    </div>
  );
}
