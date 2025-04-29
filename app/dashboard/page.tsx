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
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

export default function DashboardPage() {
  const [userId, setUserId] = useState<string | null>(null);
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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
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
          const data = {
            id: querySnapshot.docs[0].id,
            ...querySnapshot.docs[0].data(),
          };
          setBusiness(data);
          setImageUrl(data.imageUrl || '');
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
  }, [userId]);

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
        const canceledAt = new Date().toISOString();
        await updateDoc(businessRef, {
          subscriptionStatus: 'canceled',
          canceled_at: canceledAt,
        });
        setBusiness(prev => ({
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
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !business?.id) return;
  
    const file = e.target.files[0];
    setImageFile(file);
    setUploadingImage(true);
  
    try {
      const storage = getStorage();
      const storageRef = ref(storage, `businessImages/${business.id}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
  
      // Save to Firestore
      const businessRef = doc(db, 'businesses', business.id);
      await updateDoc(businessRef, { imageUrl: url });
  
      setImageUrl(url);
      alert('Image uploaded successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Image upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!business) return <p>No business found for your account.</p>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">Business Dashboard</h1>

      <div className="p-4 border rounded space-y-4">
        <h2 className="text-xl font-medium">Business Info</h2>
        <div>
          <label className="block font-medium">Business Image</label>
          {imageUrl && (
            <img
              src={imageUrl}
              alt={business.name}
              className="w-48 h-48 object-cover mb-2 rounded border"
            />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="block border rounded border-white px-2"
          />
          {uploadingImage && <p className="text-sm text-gray-500">Uploading...</p>}
          </div>
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
          <label className="block font-medium pb-5"><strong>Plan</strong></label>
          <p className='pb-5'>You are currently subscribed to <strong>{business.planType}</strong> you can change this at any time by selecting a different plan from the drop-down menu below. </p>
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
        {business.canceled_at && (
        <p><strong>Canceled At:</strong> {new Date(business.canceled_at).toLocaleString()}</p>
        )}

      {business.subscriptionStatus === 'active' && (
        <div className='flex justify-center space-x-4'>
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
      )}
      </div>
      </div>
  );
}
