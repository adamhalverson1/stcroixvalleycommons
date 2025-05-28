'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import CouponCard from '@/components/coupons/CouponCard';

interface Coupon {
  id: string;
  title: string;
  description: string;
  expirationDate: string;
  imageUrl?: string;
  isFeatured: boolean;
  businessId: string;
  slug: string;
}

export default function CouponsPage() {
  const [featuredCoupons, setFeaturedCoupons] = useState<Coupon[]>([]);
  const [regularCoupons, setRegularCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCoupons = async () => {
    try {
      const couponsRef = collection(db, 'coupons');
      const snapshot = await getDocs(couponsRef);
      const allCoupons = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Coupon[];

      // Split coupons into featured and regular in client
      const featuredData = allCoupons.filter(coupon => coupon.isFeatured);
      const regularData = allCoupons.filter(coupon => !coupon.isFeatured);

      setFeaturedCoupons(featuredData);
      setRegularCoupons(regularData);
    } catch (err: any) {
      console.error('Error fetching coupons:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 text-[#7DA195] text-xl font-medium">
        Loading coupons...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 text-red-500 text-xl font-semibold">
        Error loading coupons: {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-4xl bg-gray-100 mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center text-[#4C7C59] mb-6">Available Coupons</h1>

        {featuredCoupons.length > 0 && (
          <>
            <h2 className="text-xl font-semibold text-yellow-700 mb-4">🌟 Featured Coupons</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredCoupons.map(coupon => (
                <CouponCard key={coupon.id} coupon={coupon} />
              ))}
            </div>
          </>
        )}

        {regularCoupons.length > 0 && (
          <>
            <h2 className="text-xl font-semibold text-[#4C7C59] mt-10 mb-4">All Coupons</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {regularCoupons.map(coupon => (
                <CouponCard key={coupon.id} coupon={coupon} />
              ))}
            </div>
          </>
        )}

        {featuredCoupons.length === 0 && regularCoupons.length === 0 && (
          <p className="text-center text-gray-500 mt-10">No coupons found.</p>
        )}
      </div>
    </div>
  );
}
