'use client';

import { useRouter } from 'next/navigation';
import { Sparkles, Star } from 'lucide-react';

export default function SelectPlanPage() {
  const router = useRouter();

  const handlePlanSelect = (priceId: string, plan: string) => {
    localStorage.setItem('selectedPriceId', priceId);
    localStorage.setItem('selectedPlan', plan);
    router.push('/sign-up');
  };

  return (
    <div className="min-h-screen bg-[#F5F3EE] px-4 py-12 flex items-center justify-center">
      <div className="grid gap-8 sm:grid-cols-2 max-w-4xl w-full">
        {/* Basic Plan */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-6 flex flex-col items-center text-center hover:shadow-lg transition">
          <Sparkles className="text-[#7A9D54] w-10 h-10 mb-4" />
          <h2 className="text-2xl font-semibold text-[#305D74]">Basic Plan</h2>
          <p className="text-[#4A4A4A] mt-2 mb-4">
            Ideal for small businesses looking to gain visibility and connect with local customers.
          </p>
          <ul className="text-sm text-gray-700 space-y-2 text-left">
            <li>✔ Business profile with name, logo, description, and contact info</li>
            <li>✔ Appear in location & category-based directory searches</li>
            <li>✔ Access to dashboard for listing updates</li>
            <li>✔ 1 Basic Event per month</li>
            <li>✔ 1 Basic Coupon</li>
          </ul>
          <p className="text-xl font-bold mt-6 text-[#7A9D54]">$10/month</p>
          <button
            onClick={() => handlePlanSelect('price_1REuzXKabuDj6Ug3So8O4OSY', 'basic')}
            className="mt-6 px-6 py-2 rounded-full bg-[#7A9D54] text-white font-medium hover:bg-[#67864a] transition"
          >
            Choose Basic
          </button>
        </div>

        {/* Featured Plan */}
        <div className="bg-white border-2 border-[#C4A484] rounded-2xl shadow-md p-6 flex flex-col items-center text-center hover:shadow-lg transition">
          <Star className="text-[#C4A484] w-10 h-10 mb-4" />
          <h2 className="text-2xl font-semibold text-[#305D74]">Featured Plan</h2>
          <p className="text-[#4A4A4A] mt-2 mb-4">
            Designed for businesses ready to boost visibility and drive more leads.
          </p>
          <ul className="text-sm text-gray-700 space-y-2 text-left">
            <li><strong>Everything in Basic, plus:</strong></li>
            <li>✔ Priority placement in search results and category pages</li>
            <li>✔ Optional direct messaging or inquiry form</li>
            <li>✔ Choose up to 3 categories for your business</li>
            <li>✔ Upload attachments (menus, brochures, etc.)</li>
            <li>✔ 1 Featured Event per month</li>
            <li>✔ 1 Featured Coupon</li>
          </ul>
          <p className="text-xl font-bold mt-6 text-[#C4A484]">$25/month</p>
          <button
            onClick={() => handlePlanSelect('price_1REuzvKabuDj6Ug30bfZ2sDL', 'featured')}
            className="mt-6 px-6 py-2 rounded-full bg-[#C4A484] text-white font-medium hover:bg-[#af8d6e] transition"
          >
            Choose Featured
          </button>
        </div>
      </div>
    </div>
  );
}
