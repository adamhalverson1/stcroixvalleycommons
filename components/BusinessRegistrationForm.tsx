'use client';
import { useState } from 'react';
import { db } from '@/lib/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

export default function RegisterBusinessPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    website: '',
    category: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const docRef = await addDoc(collection(db, 'businesses'), {
        ...form,
        createdAt: serverTimestamp(),
        plan: null,
      });
      localStorage.setItem('businessId', docRef.id);
      router.push('/select-plan');
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
      <input name="name" onChange={handleChange} required placeholder="Business Name" />
      <input name="email" onChange={handleChange} required placeholder="Email" />
      <input name="phone" onChange={handleChange} placeholder="Phone" />
      <input name="address" onChange={handleChange} placeholder="Address" />
      <input name="city" onChange={handleChange} placeholder="City" />
      <input name="state" onChange={handleChange} placeholder="State" />
      <input name="website" onChange={handleChange} placeholder="Website" />
      <input name="category" onChange={handleChange} placeholder="Category" />
      <button type="submit">Continue to Plan</button>
    </form>
  );
}