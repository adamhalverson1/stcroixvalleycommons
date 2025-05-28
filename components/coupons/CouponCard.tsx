'use client';

import { useRouter } from 'next/navigation';

type Props = {
  coupon: {
    id: string;
    title: string;
    description: string;
    expirationDate: string;
    imageUrl?: string;
    isFeatured: boolean;
    slug: string;
  };
};

export default function CouponCard({ coupon }: Props) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/coupons/${coupon.slug}`);
  };

  return (
    <div
      onClick={handleClick}
      className="cursor-pointer border rounded-lg shadow-md p-4 bg-white hover:shadow-lg transition"
    >
      {coupon.imageUrl && (
        <img
          src={coupon.imageUrl}
          alt={coupon.title}
          className="w-full h-40 object-cover rounded mb-3"
        />
      )}
      <h3 className="text-lg font-semibold text-[#4C7C59]">{coupon.title}</h3>
      <p className="text-sm text-gray-600">{coupon.description}</p>
      <p className="text-sm text-gray-500 mt-1">
        Expires on {coupon.expirationDate}
      </p>
      {coupon.isFeatured && (
        <span className="inline-block mt-2 text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
          ★ Featured
        </span>
      )}
    </div>
  );
}
