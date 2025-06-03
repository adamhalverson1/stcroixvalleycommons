'use client';

import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

type Coupon = {
  id: string;
  title: string;
  description: string;
  expirationDate: string;
  isFeatured: boolean;
};

type Props = {
  coupon: Coupon;
  onClose: () => void;
};

export default function EditCouponModal({ coupon, onClose }: Props) {
  const [title, setTitle] = useState(coupon.title);
  const [description, setDescription] = useState(coupon.description);
  const [expirationDate, setExpirationDate] = useState(coupon.expirationDate);
  const [isFeatured, setIsFeatured] = useState(coupon.isFeatured);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const couponRef = doc(db, 'coupons', coupon.id);
      await updateDoc(couponRef, {
        title,
        description,
        expirationDate,
        isFeatured,
      });
      onClose();
    } catch (err) {
      console.error('Failed to update coupon:', err);
      setError('Failed to update coupon. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold text-[#4C7C59] mb-4">Edit Coupon</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-red-600">{error}</p>}

          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Coupon Title"
            className="w-full p-2 border rounded text-black"
            required
          />

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Coupon Description"
            className="w-full p-2 border rounded text-black"
            rows={4}
            required
          />

          <input
            type="date"
            value={expirationDate}
            onChange={(e) => setExpirationDate(e.target.value)}
            className="w-full p-2 border rounded text-black"
            required
          />


          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded text-black hover:bg-gray-100"
              disabled={submitting}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-4 py-2 bg-[#4C7C59] text-white rounded hover:bg-[#3a6349]"
              disabled={submitting}
            >
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
