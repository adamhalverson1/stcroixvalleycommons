'use client'

import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { BusinessForm } from '@/components/dashboard/BusinessForm';
import { BusinessImage } from '@/components/dashboard/BusinessImage';
import { BusinessHours } from '@/components/dashboard/BusinessHours';
import { SubscriptionManager } from '@/components/dashboard/SubscriptionManager';
import { BusinessAttachments } from '@/components/dashboard/BusinessAttachments';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [business, setBusiness] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Query business by ownerId (user.uid)
          const businessesRef = collection(db, 'businesses');
          const q = query(businessesRef, where('userId', '==', user.uid));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const docSnap = querySnapshot.docs[0];
            setBusiness({ id: docSnap.id, ...docSnap.data() });
          } else {
            setBusiness(null);
          }
        } catch (err) {
          console.error('Error fetching business:', err);
          setBusiness(null);
        } finally {
          setLoading(false);
        }
      } else {
        setBusiness(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (!business) return <p>No Business Found</p>;

  return (
    <div className="bg-gray-100 min-h-screen px-6">
      <h1 className="text-3xl font-bold text-[#4C7C59] text-center">Business Dashboard</h1>
      <div className="space-y-6">
        <BusinessForm business={business} setBusiness={setBusiness} />
        <BusinessImage business={business} setBusiness={setBusiness} />
        <BusinessAttachments business={business} setBusiness={setBusiness} />
        <BusinessHours business={business} setBusiness={setBusiness} />
        <SubscriptionManager business={business} setBusiness={setBusiness} />

      </div>
    </div>
  );
}
