'use client';

import { use, useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface Coupon {
  id: string;
  title: string;
  description: string;
  code: string;
  expiryDate: string;
  businessId: string;
  isFeatured: boolean;
  slug: string;
  imageUrl?: string;
}

interface Params {
  params: Promise<{ slug: string }>;
}

export default function CouponDetailPage({ params }: Params) {
  const { slug } = use(params); // ✅ unwrap the params promise
  const router = useRouter();

  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCoupon() {
      try {
        const snapshot = await getDocs(collection(db, 'coupons'));
        const foundCoupon = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as Coupon))
          .find(c => c.slug === slug);

        if (!foundCoupon) {
          router.replace('/not-found'); // simulate `notFound()` behavior
        } else {
          setCoupon(foundCoupon);
        }
      } catch (error) {
        console.error('Error fetching coupon:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchCoupon();
  }, [slug, router]);

  if (loading) {
    return <p className="text-center py-10 text-gray-600">Loading coupon...</p>;
  }

  if (!coupon) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6 sm:px-12">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-lg overflow-hidden">
        {coupon.imageUrl && (
          <div className="relative w-full h-72 sm:h-96">
            <Image
              src={coupon.imageUrl}
              alt={coupon.title}
              fill
              style={{ objectFit: 'cover' }}
              className="rounded-t-3xl"
              priority
            />
          </div>
        )}

        <div className="p-8 sm:p-12">
          <h1 className="text-4xl font-extrabold text-[#2C5F2D] mb-4 leading-tight">
            {coupon.title}
          </h1>

          {coupon.isFeatured && (
            <p className="inline-block bg-yellow-100 text-yellow-800 font-semibold px-3 py-1 rounded-full mb-6">
              🌟 Featured Coupon
            </p>
          )}

          <p className="text-gray-700 mb-4 whitespace-pre-line">{coupon.description}</p>

          <div className="mb-6">
            <span className="font-semibold text-gray-800 text-lg">Coupon Code: </span>
            <span className="bg-gray-200 text-gray-900 font-mono px-3 py-1 rounded-md select-all cursor-pointer">
              {coupon.code}
            </span>
          </div>

          <p className="text-gray-600 text-sm italic">
            Expires on: {coupon.expiryDate}
          </p>
        </div>
      </div>
    </div>
  );
}
