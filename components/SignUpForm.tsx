'use client';

import { useState } from 'react';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function SignUpForm() {
  const router = useRouter();
  const auth = getAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
  
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push('/select-plan'); // ✅ redirect after successful sign-up
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
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
      >
        {loading ? 'Creating Account...' : 'Sign Up'}
      </button>
    </form>
  );
}
