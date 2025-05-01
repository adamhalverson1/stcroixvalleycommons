'use client';

import { Sparkles, Star } from 'lucide-react';

export default function SelectPlanPage() {
  const handleSubscribe = async (priceId: string, plan: string) => {
    const businessId = localStorage.getItem('businessId');
    if (!businessId) return alert('Missing business ID');

    const res = await fetch('/api/checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ businessId, priceId, plan }),
    });

    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      alert('Failed to start checkout');
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F3EE] px-4 py-12 flex items-center justify-center">
      <div className="grid gap-8 sm:grid-cols-2 max-w-4xl w-full">
        {/* Basic Plan */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-6 flex flex-col items-center text-center hover:shadow-lg transition">
          <Sparkles className="text-[#7A9D54] w-10 h-10 mb-2" />
          <h2 className="text-2xl font-semibold text-[#305D74]">Basic Plan</h2>
          <p className="text-[#4A4A4A] mt-2">Great for getting started</p>
          <p className="text-xl font-bold mt-4 text-[#7A9D54]">$10/month</p>
          <button
            onClick={() =>
              handleSubscribe('price_1REuzXKabuDj6Ug3So8O4OSY', 'basic')
            }
            className="mt-6 px-6 py-2 rounded-full bg-[#7A9D54] text-white font-medium hover:bg-[#67864a] transition"
          >
            Choose Basic
          </button>
        </div>

        {/* Featured Plan */}
        <div className="bg-white border-2 border-[#C4A484] rounded-2xl shadow-md p-6 flex flex-col items-center text-center hover:shadow-lg transition">
          <Star className="text-[#C4A484] w-10 h-10 mb-2" />
          <h2 className="text-2xl font-semibold text-[#305D74]">Featured Plan</h2>
          <p className="text-[#4A4A4A] mt-2">More visibility, more traffic</p>
          <p className="text-xl font-bold mt-4 text-[#C4A484]">$25/month</p>
          <button
            onClick={() =>
              handleSubscribe('price_1REuzvKabuDj6Ug30bfZ2sDL', 'featured')
            }
            className="mt-6 px-6 py-2 rounded-full bg-[#C4A484] text-white font-medium hover:bg-[#af8d6e] transition"
          >
            Choose Featured
          </button>
        </div>
      </div>
    </div>
  );
}
