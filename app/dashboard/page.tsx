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

  const handleStripePortal = async () => {
    try {
      const res = await fetch('/api/update-stripe-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: business.id,
          newPlan: formState.planType,
        }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error redirecting to Stripe:', error);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!business) return <p>No business found for your account.</p>;

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-semibold">Business Dashboard</h1>

      <div className="p-4 border rounded space-y-2">
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

      <div className="p-4 border rounded">
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
        <button
          onClick={handleStripePortal}
          className="bg-blue-600 text-white px-4 py-2 rounded mt-2"
        >
          Manage Billing
        </button>
      </div>
    </div>
  );
}
