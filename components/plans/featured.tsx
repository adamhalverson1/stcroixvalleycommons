'use client'
import { Star } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function FeaturedPlan (){
  const router = useRouter();

    const handlePlanSelect = (priceId: string, plan: string) => {
    localStorage.setItem('selectedPriceId', priceId);
    localStorage.setItem('selectedPlan', plan);
    router.push('/sign-up');
    };

return(
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
        </div>
)
}