'use client';

import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { BusinessForm } from '@/components/dashboard/BusinessForm';
import { BusinessImage } from '@/components/dashboard/BusinessImage';
import { BusinessHours } from '@/components/dashboard/BusinessHours';
import { SubscriptionManager } from '@/components/dashboard/SubscriptionManager';
import { BusinessAttachments } from '@/components/dashboard/BusinessAttachments';
import PostEventForm from '@/components/events/PostEventForm';
import EventList from '@/components/events/EventList';
import PostCouponForm from '@/components/coupons/PostCouponForm';
import CouponList from '@/components/coupons/CouponList';
import type { Business } from '@/types/business';

const TABS = ['Business Info', 'Events', 'Coupons', 'Subscription'];

const emptyBusiness: Business = {
  id: '',
  name: '',
  description: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  state: '',
  serviceArea: '',
  website: '',
  Facebook: '',
  Twitter: '',
  Instagram: '',
  plan: 'basic',
  categories: [],
  category: [],
  image: '',
  imageUrl: '',
  subscriptionId: '', 
  subscriptionStatus: '',
  attachments: [], // assuming this is part of the type
  hours: {},
  slug: '',       // assuming business hours are stored in an object
};

function isValidPlan(plan: any): plan is 'basic' | 'featured' {
  return plan === 'basic' || plan === 'featured';
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [business, setBusiness] = useState<Business>(emptyBusiness);
  const [activeTab, setActiveTab] = useState('Business Info');

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const q = query(
            collection(db, 'businesses'),
            where('userId', '==', user.uid)
          );
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const docSnap = querySnapshot.docs[0];
            setBusiness({ ...(docSnap.data() as Business), id: docSnap.id });
          } else {
            setBusiness(emptyBusiness);
          }
        } catch (err) {
          console.error('Error fetching business:', err);
          setBusiness(emptyBusiness);
        } finally {
          setLoading(false);
        }
      } else {
        setBusiness(emptyBusiness);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <p className="text-center py-10">Loading...</p>;
  if (!business.id) return <p className="bg-gray-50 min-h-screen px-4 sm:px-6 text-center py-10 text-red-600">No Business Found. Please Contact support@willowriverdigital.com for assistance.</p>;

  return (
    <div className="bg-gray-50 min-h-screen px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-bold text-center text-[#4C7C59] mb-8">Business Dashboard</h1>

      {/* Tabs */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex rounded-lg border border-gray-300 bg-white shadow-sm overflow-hidden">
          {TABS.map((tab) => (
            <button
              key={tab}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === tab
                  ? 'bg-[#4C7C59] text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white shadow-sm rounded-xl p-4 sm:p-6 border border-gray-200">
        {activeTab === 'Business Info' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <BusinessForm business={business} setBusiness={setBusiness} />
            </div>
            <div className="space-y-6">
              <BusinessImage business={business} setBusiness={setBusiness} />
              <BusinessAttachments business={business} setBusiness={setBusiness} />
              <BusinessHours business={business} setBusiness={setBusiness} />
            </div>
          </div>
        )}

        {activeTab === 'Events' && isValidPlan(business.plan) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PostEventForm businessId={business.id} plan={business.plan} />
            <EventList businessId={business.id} />
          </div>
        )}

        {activeTab === 'Coupons' && isValidPlan(business.plan) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PostCouponForm businessId={business.id} plan={business.plan} />
            <CouponList businessId={business.id} />
          </div>
        )}

        {activeTab === 'Subscription' && (
          <div className="space-y-6">
            <SubscriptionManager business={business} setBusiness={setBusiness} />
          </div>
        )}
      </div>
    </div>
  );
}
