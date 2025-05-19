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

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];


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
    plan: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    website: '',
    category: '',
    description: '',
    hours: '',
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
            plan: data.plan || '',
            phone: data.phone || '',
            address: data.address || '',
            city: data.city || '',
            state: data.state || '',
            website: data.website || '',
            category: data.category || '',
            description: data.description || '',
            hours: data.hours || '',
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
          newPlanPriceId: formState.plan === 'Featured'
            ? process.env.NEXT_PUBLIC_STRIPE_FEATURED_PRICE_ID
            : process.env.NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID,
        }),
      });

      const data = await res.json();
      if (data.success) {
        const businessRef = doc(db, 'businesses', business.id);
        await updateDoc(businessRef, {
          plan: formState.plan,
        });
        setBusiness(prev => ({ ...prev, plan: formState.plan }));
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

  const [daysOpen, setDaysOpen] = useState<string[]>([]);
  const [form, setForm] = useState<{
    hours: {
      [key: string]: { open: string; close: string };
    };
  }>({
    hours: {},
  });

  const handleHoursChange = (day: string, field: "open" | "close", value: string) => {
    setForm((prev) => ({
      ...prev,
      hours: {
        ...prev.hours,
        [day]: {
          ...prev.hours[day],
          [field]: value,
        },
      },
    }));
  };

  const handleDayToggle = (day: string) => {
    setDaysOpen((prev) => {
      const updated = prev.includes(day)
        ? prev.filter((d) => d !== day)
        : [...prev, day];

      // If adding the day, ensure it has default time
      if (!prev.includes(day)) {
        setForm((prevForm) => ({
          ...prevForm,
          hours: {
            ...prevForm.hours,
            [day]: prevForm.hours[day] || { open: "", close: "" },
          },
        }));
      }

      return updated;
    });
  };


  if (loading) return <p>Loading...</p>;
 if (!business) {
  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center px-4">
      <div className="bg-white shadow-md rounded-xl p-6 max-w-md text-center">
        <h2 className="text-2xl font-semibold text-[#4C7C59] mb-4">
          No Business Found
        </h2>
        <p className="text-gray-700 mb-4">
          We couldn’t find a business associated with your account.
        </p>
        <p className="text-gray-600">
          If you believe this is an error, please contact us at{" "}
          <a
            href="mailto:support@willowriverdigital.com"
            className="text-[#0046a4] font-medium underline"
          >
            support@willowriverdigital.com
          </a>
          .
        </p>
      </div>
    </div>
  );
}

  return (      
      <div className="bg-gray-100 min-h-screen px-6">
        <h1 className="text-3xl font-bold text-[#4C7C59] flex justify-center">Business Dashboard</h1>
    
        {/* Business Info */}
        <div className="bg-white shadow-md rounded-xl p-6 space-y-6">
          <h2 className="text-2xl font-semibold text-[#4C7C59] flex justify-center">Business Info</h2>
    
          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {['name', 'phone', 'email', 'address', 'city', 'state', 'website'].map((field) => (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-700 capitalize mb-1">{field}</label>
                <input
                  type="text"
                  name={field}
                  value={(formState as any)[field]}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 text-black focus:ring-[#4C7C59]"
                />
              </div>
            ))}
          </div>
          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={formState.description}
              onChange={handleChange}
              rows={4}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 text-black focus:ring-[#4C7C59]"
            />
          </div>

          <div className="border rounded-lg p-4 bg-gray-50">
      <h3 className="text-lg font-semibold text-[#2C3E50] mb-4 text-center">
        Business Hours
      </h3>

      <div className="space-y-2 mb-4">
        <p className="text-sm text-[#2C3E50] font-medium">
          Select the days your business is open:
        </p>
        <div className="grid grid-cols-2 gap-2">
          {daysOfWeek.map((day) => (
            <label
              key={day}
              className="flex items-center space-x-2 text-[#2C3E50]"
            >
              <input
                type="checkbox"
                checked={daysOpen.includes(day)}
                onChange={() => handleDayToggle(day)}
              />
              <span>{day}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {daysOpen.map((day) => (
          <div key={day} className="flex items-center justify-between gap-4">
            <span className="w-1/4 font-medium text-[#2C3E50]">{day}</span>
            <input
              type="time"
              value={form.hours[day]?.open || ""}
              onChange={(e) => handleHoursChange(day, "open", e.target.value)}
              className="w-full border rounded px-2 py-1 text-[#2C3E50]"
              required
            />
            <span className="text-sm text-[#2C3E50]">to</span>
            <input
              type="time"
              value={form.hours[day]?.close || ""}
              onChange={(e) => handleHoursChange(day, "close", e.target.value)}
              className="w-full border rounded px-2 py-1 text-[#2C3E50]"
              required
            />
          </div>
        ))}
      </div>
    </div>
          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              name="category"
              value={formState.category}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none text-black focus:ring-2 focus:ring-[#4C7C59]"
            >
              <option value="">Select Category</option>
              {[
                'Retail & Consumer Goods',
                'Food & Beverage',
                'Professional Services',
                'Health & Wellness',
                'Education & Training',
                'Technology & IT',
                'Finance & Insurance',
                'Automotive',
                'Home Services',
                'Arts, Entertainment & Recreation',
                'Logistics & Transportation',
                'Pets & Animals',
              ].map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Business Image */}
          <div>
            <label className="block mb-1 font-medium text-[#2C3E50]">Business Image</label>
            {imageUrl && (
              <img
                src={imageUrl}
                alt={business.name}
                className="w-32 h-32 object-cover rounded-md border mb-3"
              />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="file-input file-input-bordered w-full max-w-xs"
            />
            {uploadingImage && <p className="text-sm text-gray-500 mt-1">Uploading...</p>}
          </div>
    
          <div className="pt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#4C7C59] hover:bg-[#7DA195] text-white font-medium px-5 py-2 rounded-md transition disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
    
        {/* Subscription Section */}
        <div className="bg-white shadow-md rounded-xl p-6 space-y-4">
          <h2 className="text-2xl font-semibold text-[#4C7C59] flex justify-center">Subscription</h2>
          <div>
            <p className="text-gray-600">
              You are currently subscribed to <strong>{business.plan}</strong>. You can change your plan below:
            </p>
            <select
              name="plan"
              value={formState.plan}
              onChange={handleChange}
              className="w-full mt-2 border border-gray-300 rounded-md px-3 py-2 focus:outline-none text-black focus:ring-2 focus:ring-[#4C7C59]"
            >
              <option value="Basic">Basic</option>
              <option value="Featured">Featured</option>
            </select>
          </div>
    
          <p className="text-sm text-gray-700">
            <strong>Status:</strong> {business.subscriptionStatus || 'Not subscribed'}
          </p>
          {business.canceled_at && (
            <p className="text-sm text-red-600">
              <strong>Canceled At:</strong> {new Date(business.canceled_at).toLocaleString()}
            </p>
          )}
    
          {business.subscriptionStatus === 'active' && (
            <div className="flex gap-4 pt-2">
              <button
                onClick={handleChangePlan}
                disabled={updatingPlan}
                className="bg-green-600 hover:bg-green-700 text-white font-medium px-5 py-2 rounded-md transition disabled:opacity-50"
              >
                {updatingPlan ? 'Updating...' : 'Update Plan'}
              </button>
              <button
                onClick={handleCancelSubscription}
                disabled={cancelling}
                className="bg-red-600 hover:bg-red-700 text-white font-medium px-5 py-2 rounded-md transition disabled:opacity-50"
              >
                {cancelling ? 'Cancelling...' : 'Cancel Subscription'}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }    
