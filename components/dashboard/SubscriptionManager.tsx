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
import { Sparkles, Star } from 'lucide-react';
import FeaturedPlan from '../plans/featured';
import { BasicEvaluatedExpression } from 'next/dist/compiled/webpack/webpack';
import BasicPlan from '../plans/basic';

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
  };

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

  const handleStartSubscription = async () => {
    if (!business.id || !formState.plan) return;
    try {
      const res = await fetch('/api/checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: business.id,
          plan: formState.plan,
        }),
      });

      const data = await res.json();
      if (data?.url) {
        window.location.href = data.url;
      } else {
        alert('Failed to start checkout session.');
      }
    } catch (error) {
      console.error('Error starting checkout session:', error);
    }
  };

  if (loading) {
    return (
      <p className="text-center py-10 text-gray-500">
        Loading subscription...
      </p>
    );
  }

  const isInactive =
    business?.subscriptionStatus !== 'active' || !business.subscriptionId;

  return (
    <div className="space-y-10">
      <div className="grid gap-8 sm:grid-cols-2 w-full">
        <BasicPlan/>
        <FeaturedPlan/>

      </div>

      <div className="max-w-xl mx-auto bg-white border p-6 rounded-xl">
        <h2 className="text-xl font-bold text-center mb-4 text-[#4C7C59]">
          {isInactive ? 'Subscribe to a Plan' : 'Manage Subscription'}
        </h2>

        <label className="block mb-2 text-sm font-medium text-gray-700">
          Select Plan
        </label>
        <select
          name="plan"
          value={formState.plan}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4 text-black"
        >
          <option value="">Choose a plan</option>
          <option value="basic">Basic - $10/month</option>
          <option value="featured">Featured - $25/month</option>
        </select>

        {isInactive ? (
          <button
            onClick={handleStartSubscription}
            disabled={!formState.plan}
            className="w-full bg-[#4C7C59] text-white py-2 px-4 rounded-md hover:bg-[#3b6447]"
          >
            Subscribe Now
          </button>
        ) : (
          <div className="flex gap-4">
            <button
              onClick={handleChangePlan}
              disabled={updatingPlan}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {updatingPlan ? 'Updating...' : 'Update Plan'}
            </button>
            <button
              onClick={handleCancelSubscription}
              disabled={cancelling}
              className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              {cancelling ? 'Cancelling...' : 'Cancel Subscription'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
