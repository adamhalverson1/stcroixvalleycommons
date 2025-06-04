'use client';

import { useState, useEffect } from 'react';
import {
  addDoc,
  collection,
  Timestamp,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { uploadImage } from '@/lib/uploadImage'; // utility to upload to Firebase Storage

// Slugify helper (same as your event form)
function slugify(text: string): string {
  return text
    .toString()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// Generate unique slug for coupons
async function generateUniqueSlug(title: string): Promise<string> {
  const baseSlug = slugify(title);
  let slug = baseSlug;
  let counter = 1;

  const couponsRef = collection(db, 'coupons');
  let existing = await getDocs(query(couponsRef, where('slug', '==', slug)));

  while (!existing.empty) {
    slug = `${baseSlug}-${counter++}`;
    existing = await getDocs(query(couponsRef, where('slug', '==', slug)));
  }

  return slug;
}

type Props = {
  businessId: string;
  plan: 'basic' | 'featured';
  refreshBusiness: () => Promise<void>;
  onCouponPosted: () => void;
};

export default function PostCouponForm({ businessId, plan, refreshBusiness, onCouponPosted }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [code, setCode] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [canPost, setCanPost] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const checkPostingEligibility = async () => {
    setLoading(true);

    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const couponsRef = collection(db, 'coupons');
      const businessQuery = query(
        couponsRef,
        where('businessId', '==', businessId)
      );

      const snapshot = await getDocs(businessQuery);

      // Filter client-side by createdAt timestamp within current month
      const couponsThisMonth = snapshot.docs.filter((doc) => {
        const createdAt = doc.data().createdAt?.toDate?.();
        return (
          createdAt &&
          createdAt >= startOfMonth &&
          createdAt <= endOfMonth
        );
      });

      if (plan === 'basic') {
        setCanPost(couponsThisMonth.length < 1);
      } else if (plan === 'featured') {
        setCanPost(couponsThisMonth.length < 5);
      } else {
        setCanPost(false);
      }
    } catch (error) {
      console.error('Error checking coupon eligibility:', error);
      setCanPost(false);
    } finally {
      setLoading(false);
    }
  };

  checkPostingEligibility();
}, [businessId, plan]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      let imageUrl = '';
      if (image) {
        imageUrl = await uploadImage(image, `coupons/${businessId}_${Date.now()}`);
      }

      const slug = await generateUniqueSlug(title);

      await addDoc(collection(db, 'coupons'), {
        businessId,
        title,
        slug,
        description,
        code,
        expiryDate,
        imageUrl,
        isFeatured: plan === 'featured',
        createdAt: Timestamp.now(),
      });

      await refreshBusiness();
      onCouponPosted();

      setSuccess(true);
      setTitle('');
      setDescription('');
      setCode('');
      setExpiryDate('');
      setImage(null);
    } catch (err) {
      console.error('Error creating coupon:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white rounded max-w-lg mx-auto">
      <h2 className="text-xl font-semibold text-[#4C7C59]">Post a Coupon</h2>

      {loading ? (
        <p className="text-gray-600">Checking posting eligibility...</p>
      ) : !canPost ? (
        <p className="text-red-600 font-medium">
          {plan === 'basic'
            ? 'Basic plan allows only 1 coupon per month. Please wait until next month to post again.'
            : 'Featured plan allows up to 5 coupons per month. You have reached your limit for this month.'}
        </p>
      ) : (
        <>
          {success && <p className="text-green-600">Coupon posted successfully!</p>}
        <h1 className='text-black'>Coupon Name</h1>
          <input
            type="text"
            placeholder="Coupon Title"
            className="w-full text-black p-2 border rounded"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        <h1 className='text-black'>Coupon Description</h1>
          <textarea
            placeholder="Coupon Description"
            className="w-full text-black p-2 border rounded"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        <h1 className='text-black'>Coupon Code</h1>
          <input
            type="text"
            placeholder="Coupon Code"
            className="w-full text-black p-2 border rounded"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />
            <h1 className='text-black'>Expiration</h1>
          <input
            type="date"
            className="w-full text-black p-2 border rounded"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            required
          />

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files?.[0] || null)}
          />

          <button
            type="submit"
            className="px-4 py-2 bg-[#4C7C59] text-white rounded hover:bg-[#3a6349]"
            disabled={submitting}
          >
            {submitting ? 'Posting...' : plan === 'featured' ? 'Post Featured Coupon' : 'Post Coupon'}
          </button>
        </>
      )}
    </form>
  );
}
