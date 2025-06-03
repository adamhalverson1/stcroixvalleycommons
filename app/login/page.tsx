'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/dashboard');
    } catch (err: any) {
      switch (err.code) {
        case 'auth/invalid-email':
          setError('Please enter a valid email address.');
          break;
        case 'auth/user-not-found':
          setError('No account found with this email.');
          break;
        case 'auth/wrong-password':
          setError('Incorrect password. Please try again.');
          break;
        case 'auth/too-many-requests':
          setError('Too many failed attempts. Please try again later.');
          break;
        default:
          setError('Invalid Username or Password');
      }
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen px-6 py-8 flex items-center justify-center">
      <form
        onSubmit={handleLogin}
        className="bg-white p-6 rounded shadow-md w-full max-w-md"
      >
        <h1 className="text-3xl font-bold text-center text-[#4C7C59] mb-6">
          Business Sign In
        </h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 border border-gray-300 rounded mb-4 text-black"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 border border-gray-300 rounded text-black"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <div className="text-right mb-4">
          <button
            type="button"
            onClick={() => router.push('/reset-password')}
            className="text-sm text-[#4C7C59] hover:underline"
          >
            Forgot your password?
          </button>
        </div>
        <button
          type="submit"
          className="w-full bg-[#2C3E50] text-white py-2 rounded hover:bg-[#1a2734]"
        >
          Sign In
        </button>
        <p className="text-center mt-4 text-sm text-gray-600">
          Don’t have an account?{' '}
          <button
            type="button"
            onClick={() => router.push('/register-business')}
            className="text-[#4C7C59] hover:underline font-medium"
          >
            Sign up here
          </button>
        </p>
      </form>
    </div>
  );
}
