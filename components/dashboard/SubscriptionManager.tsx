'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { Business } from '@/types/business';

interface SubscriptionManagerProps {
  business: Business;
  setBusiness: React.Dispatch<React.SetStateAction<Business>>;
  refreshBusiness: () => Promise<void>;
}

export function SubscriptionManager({
  business,
  setBusiness,
  refreshBusiness,
}: SubscriptionManagerProps) {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [formState, setFormState] = useState({ plan: '' });
  const [updatingPlan, setUpdatingPlan] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  // Track auth user
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch business once we have userId
  useEffect(() => {
    const fetchBusiness = async () => {
      if (!userId) return;

      try {
        const businessesRef = collection(db, 'businesses');
        const q = query(businessesRef, where('userId', '==', userId));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const docSnap = querySnapshot.docs[0];
          const raw = docSnap.data() as Omit<Business, 'id'>;
          const data: Business = {
            id: docSnap.id,
            ...raw,
          };
          setBusiness(data);
          setFormState({ plan: data.plan || '' });
        }
      } catch (error) {
        console.error('Error fetching business:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBusiness();
  }, [userId, setBusiness]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  }

  const handleChangePlan = async () => {
    if (!business.id || !business.subscriptionId) return;
    setUpdatingPlan(true);
    try {
      const res = await fetch('/api/change-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: business.id,
          subscriptionId: business.subscriptionId,
          newPlanPriceId:
            formState.plan === 'featured'
              ? process.env.NEXT_PUBLIC_STRIPE_FEATURED_PRICE_ID
              : process.env.NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID,
        }),
      });
      const data = await res.json();

      if (data.success) {
        const businessRef = doc(db, 'businesses', business.id);
        await updateDoc(businessRef, { plan: formState.plan });
        setBusiness((prev) => ({ ...prev, plan: formState.plan }));
        alert('Plan updated successfully!');
        await refreshBusiness();
      } else {
        alert('Failed to update plan.');
      }
    } catch (error) {
      console.error('Error changing plan:', error);
    } finally {
      setUpdatingPlan(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!business.id || !business.subscriptionId) return;
    setCancelling(true);
    try {
      const res = await fetch('/api/cancel-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: business.id,
          subscriptionId: business.subscriptionId,
        }),
      });
      const data = await res.json();

      if (data.success) {
        const canceledAt = new Date().toISOString();
        const businessRef = doc(db, 'businesses', business.id);
        await updateDoc(businessRef, {
          subscriptionStatus: 'canceled',
          canceled_at: canceledAt,
        });
        setBusiness((prev) => ({
          ...prev,
          subscriptionStatus: 'canceled',
          canceled_at: canceledAt,
        }));
        alert('Subscription canceled successfully!');
      } else {
        alert('Failed to cancel subscription.');
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <p className="text-center py-10 text-gray-500">
        Loading subscription...
      </p>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-[#4C7C59] text-center mb-6">
        Manage Subscription
      </h1>
      <div className="bg-white border-2 rounded-xl p-6 max-w-xl mx-auto">
        {business ? (
          <>
            <p className="text-gray-600 mb-2">
              You are currently subscribed to{' '}
              <strong>{business.plan || 'N/A'}</strong>.
            </p>
            <p className="text-gray-600 mb-4">
              Subscription status:{' '}
              <strong>{business.subscriptionStatus || 'N/A'}</strong>
            </p>

            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Plan
            </label>
            <select
              name="plan"
              value={formState.plan}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-[#4C7C59]"
            >
              <option value="basic">Basic</option>
              <option value="featured">Featured</option>
            </select>

            <div className="flex justify-between gap-4 mt-6">
              <button
                onClick={handleChangePlan}
                disabled={updatingPlan}
                className="bg-[#4C7C59] text-white px-4 py-2 rounded-md hover:bg-[#3b644a] disabled:opacity-50"
              >
                {updatingPlan ? 'Updating...' : 'Update Plan'}
              </button>
              <button
                onClick={handleCancelSubscription}
                disabled={cancelling}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {cancelling ? 'Cancelling...' : 'Cancel Subscription'}
              </button>
            </div>
          </>
        ) : (
          <p className="text-center text-gray-500">
            No subscription found for this account.
          </p>
        )}
      </div>
    </div>
  );
}
