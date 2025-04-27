'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from 'firebase/firestore';

export default function DashboardPage() {
  const { user } = useUser();
  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingPlan, setUpdatingPlan] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    planType: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    website: '',
    category: '',
  });

  useEffect(() => {
    const fetchBusiness = async () => {
      if (!user?.id) return;

      try {
        const businessesRef = collection(db, 'businesses');
        const q = query(businessesRef, where('userId', '==', user.id));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const data = {
            id: querySnapshot.docs[0].id,
            ...querySnapshot.docs[0].data(),
          };
          setBusiness(data);
          setFormState({
            name: data.name || '',
            email: data.email || '',
            planType: data.planType || '',
            phone: data.phone || '',
            address: data.address || '',
            city: data.city || '',
            state: data.state || '',
            website: data.website || '',
            category: data.category || '',
          });
        }
      } catch (error) {
        console.error('Error fetching business:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBusiness();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!business?.id) return;
    setSaving(true);
    try {
      const businessRef = doc(db, 'businesses', business.id);
      await updateDoc(businessRef, { ...formState });
      setBusiness(prev => ({ ...prev, ...formState }));
    } catch (error) {
      console.error('Error saving business info:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePlan = async () => {
    if (!business?.id || !business?.subscriptionId) return;
    setUpdatingPlan(true);
    try {
      const res = await fetch('/api/change-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: business.id,
          subscriptionId: business.subscriptionId,
          newPlanPriceId: formState.planType === 'Featured'
            ? process.env.NEXT_PUBLIC_STRIPE_FEATURED_PRICE_ID
            : process.env.NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID,
        }),
      });

      const data = await res.json();
      if (data.success) {
        const businessRef = doc(db, 'businesses', business.id);
        await updateDoc(businessRef, {
          planType: formState.planType,
        });
        setBusiness(prev => ({ ...prev, planType: formState.planType }));
        alert('Plan updated successfully!');
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
    if (!business?.id || !business?.subscriptionId) return;
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
        const businessRef = doc(db, 'businesses', business.id);
        await updateDoc(businessRef, {
          subscriptionStatus: 'canceled',
        });
        setBusiness(prev => ({ ...prev, subscriptionStatus: 'canceled' }));
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

  if (loading) return <p>Loading...</p>;
  if (!business) return <p>No business found for your account.</p>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">Business Dashboard</h1>

      <div className="p-4 border rounded space-y-4">
        <h2 className="text-xl font-medium">Business Info</h2>
        {['name', 'phone', 'email', 'address', 'city', 'state', 'website'].map((field) => (
          <div key={field}>
            <label className="block font-medium capitalize">{field}</label>
            <input
              type="text"
              name={field}
              value={(formState as any)[field]}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>
        ))}

        <div>
          <label className="block font-medium">Category</label>
          <select
            name="category"
            value={formState.category}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          >
            <option value="">Select Category</option>
            <option value="Retail & Consumer Goods">Retail & Consumer Goods</option>
            <option value="Food & Beverage">Food & Beverage</option>
            <option value="Professional Services">Professional Services</option>
            <option value="Health & Wellness">Health & Wellness</option>
            <option value="Education & Training">Education & Training</option>
            <option value="Technology & IT">Technology & IT</option>
            <option value="Finance & Insurance">Finance & Insurance</option>
            <option value="Automotive">Automotive</option>
            <option value="Home Services">Home Services</option>
            <option value="Arts, Entertainment & Recreation">Arts, Entertainment & Recreation</option>
            <option value="Logistics & Transportation">Logistics & Transportation</option>
            <option value="Pets & Animals">Pets & Animals</option>
          </select>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="p-4 border rounded space-y-4">
        <h2 className="text-xl font-medium">Subscription</h2>
        <div>
          <label className="block font-medium">Plan</label>
          <select
            name="planType"
            value={formState.planType}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="Basic">Basic</option>
            <option value="Featured">Featured</option>
          </select>
        </div>

        <p><strong>Status:</strong> {business.subscriptionStatus || 'Not subscribed'}</p>

        <div className="flex gap-2">
          <button
            onClick={handleChangePlan}
            disabled={updatingPlan}
            className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {updatingPlan ? 'Updating...' : 'Update Plan'}
          </button>
          <button
            onClick={handleCancelSubscription}
            disabled={cancelling}
            className="bg-red-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {cancelling ? 'Cancelling...' : 'Cancel Subscription'}
          </button>
        </div>
      </div>
    </div>
  );
}
