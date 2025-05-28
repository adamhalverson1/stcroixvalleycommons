import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { notFound } from 'next/navigation';
import Image from 'next/image';

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
  params: { slug: string };
}

export default async function CouponDetailPage({ params }: Params) {
  const { slug } = params;

  // Fetch all coupons and find matching slug (Firestore limitation)
  const snapshot = await getDocs(collection(db, 'coupons'));
  const couponDoc = snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() } as Coupon))
    .find(coupon => coupon.slug === slug);

  if (!couponDoc) return notFound();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6 sm:px-12">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-lg overflow-hidden">
        {couponDoc.imageUrl && (
          <div className="relative w-full h-72 sm:h-96">
            <Image
              src={couponDoc.imageUrl}
              alt={couponDoc.title}
              fill
              style={{ objectFit: 'cover' }}
              className="rounded-t-3xl"
              priority
            />
          </div>
        )}

        <div className="p-8 sm:p-12">
          <h1 className="text-4xl font-extrabold text-[#2C5F2D] mb-4 leading-tight">
            {couponDoc.title}
          </h1>

          {couponDoc.isFeatured && (
            <p className="inline-block bg-yellow-100 text-yellow-800 font-semibold px-3 py-1 rounded-full mb-6">
              🌟 Featured Coupon
            </p>
          )}

          <p className="text-gray-700 mb-4 whitespace-pre-line">{couponDoc.description}</p>

          <div className="mb-6">
            <span className="font-semibold text-gray-800 text-lg">Coupon Code: </span>
            <span className="bg-gray-200 text-gray-900 font-mono px-3 py-1 rounded-md select-all cursor-pointer">
              {couponDoc.code}
            </span>
          </div>

          <p className="text-gray-600 text-sm italic">
            Expires on: {couponDoc.expiryDate}
          </p>
        </div>
      </div>
    </div>
  );
}
