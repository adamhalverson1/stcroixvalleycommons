'use client';

import { useState } from 'react';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function SignUpForm() {
  const auth = getAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCred.user;

      const slug = slugify(businessName);
      const docRef = doc(db, 'businesses', slug);

      await setDoc(docRef, {
        name: businessName,
        userId: user.uid,
        createdAt: serverTimestamp(),
        plan: localStorage.getItem('selectedPlan') || null,
        slug,
      });

      // Save slug to localStorage for Stripe redirection
      localStorage.setItem('businessId', slug);

      // No redirect here — sign-up/page.tsx will handle it via onAuthStateChanged
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
      <h2 className="text-3xl font-bold text-center text-[#7DA195] mb-6">Create an Account</h2>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div>
        <label htmlFor="businessName" className="block text-lg font-medium text-[#7DA195]">Business Name</label>
        <input
          type="text"
          id="businessName"
          required
          className="w-full border border-black rounded px-3 py-2 mt-1 text-black"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-lg font-medium text-[#7DA195]">Email</label>
        <input
          type="email"
          id="email"
          required
          className="w-full border border-black rounded px-3 py-2 mt-1 text-black"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-lg font-medium text-[#7DA195]">Password</label>
        <input
          type="password"
          id="password"
          required
          className="w-full border border-black rounded px-3 py-2 mt-1 text-black"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#2C3E50] text-white font-semibold py-3 rounded-lg transition-colors hover:bg-[#1a2734]"
      >
        {loading ? 'Creating Account...' : 'Create Account & Pay'}
      </button>
    </form>
  );
}
