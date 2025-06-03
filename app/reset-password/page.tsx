'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Password reset email sent! Check your inbox.');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen px-6 py-8 flex items-center justify-center">
      <form
        onSubmit={handleReset}
        className="bg-white p-6 rounded shadow-md w-full max-w-md"
      >
        <h1 className="text-2xl font-bold text-center text-[#4C7C59] mb-6">
          Reset Your Password
        </h1>
        {message && <p className="text-green-600 mb-4">{message}</p>}
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <input
          type="email"
          placeholder="Enter your email"
          className="w-full p-2 border border-gray-300 rounded mb-4 text-black"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button
          type="submit"
          className="w-full bg-[#2C3E50] text-white py-2 rounded hover:bg-[#1a2734]"
        >
          Send Reset Link
        </button>
        <p className="text-center mt-4 text-sm text-gray-600">
          Remembered your password?{' '}
          <button
            type="button"
            onClick={() => router.push('/login')}
            className="text-[#4C7C59] hover:underline font-medium"
          >
            Back to login
          </button>
        </p>
      </form>
    </div>
  );
}
