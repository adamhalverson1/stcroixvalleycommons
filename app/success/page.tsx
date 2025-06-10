'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function SuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);

  const sessionId = searchParams.get('session_id');

  // Auto trigger subscription check and redirect
  useEffect(() => {
    if (!sessionId) {
      setError('Missing session_id in URL');
      return;
    }

    const confirmPayment = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/check-subscription?session_id=${sessionId}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data?.error || 'Subscription check failed');
          setLoading(false);
          return;
        }

        setVerified(true);
        router.push('/dashboard');
      } catch (err) {
        setError('Error confirming subscription');
        setLoading(false);
      }
    };

    confirmPayment();
  }, [router, sessionId]);

  // Manual button click handler to retry verification and redirect
  async function handleManualRedirect() {
    if (!sessionId) {
      setError('Missing session_id');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/check-subscription?session_id=${sessionId}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || 'Subscription check failed');
        setLoading(false);
        return;
      }

      setVerified(true);
      router.push('/dashboard');
    } catch {
      setError('Error confirming subscription');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white shadow-xl rounded-2xl p-8 text-center space-y-4">
        <h1 className="text-2xl font-semibold text-green-700">🎉 Business Registered!</h1>
        <p className="text-gray-700">
          You've successfully registered your business with <strong>St. Croix Commons</strong>.
        </p>

        {!loading && !verified && !error && (
          <p className="text-gray-600 text-sm">Verifying your subscription and redirecting to dashboard...</p>
        )}

        {loading && (
          <div className="w-full h-1 bg-gray-200 rounded overflow-hidden">
            <div className="h-full bg-green-500 animate-pulse transition-all duration-3000"></div>
          </div>
        )}

        {error && (
          <p className="text-red-600 text-sm">
            {error}
            <br />
            <button
              onClick={handleManualRedirect}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              disabled={loading}
            >
              Try Again / Go to Dashboard
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
