'use client';

import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import EditCouponModal from './EditCouponModal'; // You need to implement this similarly to EditEventModal

type Coupon = {
  id: string;
  title: string;
  description: string;
  expirationDate: string;
  isFeatured: boolean;
  businessId: string;
  // Add other coupon fields if needed
};

type Props = {
  businessId: string;
  refreshFlag: number;
};

export default function CouponList({ businessId, refreshFlag }: Props) {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  const fetchCoupons = async () => {
    const q = query(collection(db, 'coupons'), where('businessId', '==', businessId));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Coupon));
    setCoupons(data);
  };

  const deleteCoupon = async (id: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
    await deleteDoc(doc(db, 'coupons', id));
    fetchCoupons();
  };

  useEffect(() => {
    fetchCoupons();
  }, [businessId, refreshFlag]);

  return (
    <div className="mt-8 space-y-4">
      <h2 className="text-xl font-semibold text-[#4C7C59]">Your Coupons</h2>

      {coupons.length === 0 && <p className="text-gray-600">No coupons posted yet.</p>}

      {coupons.map((coupon) => (
        <div key={coupon.id} className="border rounded p-4 shadow-sm bg-white">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg text-[#4C7C59] font-bold">{coupon.title}</h3>
              <p className="text-md text-black font-bold">{coupon.description}</p>
              <p className="text-sm text-black">Expires on: {coupon.expirationDate}</p>
              {coupon.isFeatured && (
                <span className="text-sm text-yellow-600 font-semibold">★ Featured Coupon</span>
              )}
            </div>

            <div className="space-x-2">
              <button
                onClick={() => setEditingCoupon(coupon)}
                className="text-blue-600 hover:underline text-sm"
              >
                Edit
              </button>
              <button
                onClick={() => deleteCoupon(coupon.id)}
                className="text-red-600 hover:underline text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}

      {editingCoupon && (
        <EditCouponModal
          coupon={editingCoupon}
          onClose={() => {
            setEditingCoupon(null);
            fetchCoupons(); // refresh after edit
          }}
        />
      )}
    </div>
  );
}
