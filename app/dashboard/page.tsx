'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useUser();
  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBusiness = async () => {
      if (!user?.id) return;

      try {
        const businessesRef = collection(db, 'businesses');
        const q = query(businessesRef, where('userId', '==', user.id));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          setBusiness({ id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() });
        }
      } catch (error) {
        console.error('Error fetching business:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBusiness();
  }, [user]);

  const handleStripePortal = async () => {
    const res = await fetch('/api/create-portal-session', {
      method: 'POST',
      body: JSON.stringify({ businessId: business.id }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  };

  if (loading) return <p>Loading...</p>;

  if (!business) return <p>No business found for your account.</p>;

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-semibold">Business Dashboard</h1>

      <div className="p-4 border rounded">
        <h2 className="text-xl font-medium">Business Info</h2>
        <p><strong>Name:</strong> {business.name}</p>
        <p><strong>Email:</strong> {business.email}</p>
        <p><strong>Plan:</strong> {business.plan || 'Not selected'}</p>
        <Link href={`/edit-business/${business.id}`} className="text-blue-600 underline">Edit Info</Link>
      </div>

      <div className="p-4 border rounded">
        <h2 className="text-xl font-medium">Subscription</h2>
        <p><strong>Status:</strong> {business.subscriptionStatus || 'Not subscribed'}</p>
        <button onClick={handleStripePortal} className="bg-blue-600 text-white px-4 py-2 rounded">
          Manage Billing
        </button>
      </div>
    </div>
  );
}
