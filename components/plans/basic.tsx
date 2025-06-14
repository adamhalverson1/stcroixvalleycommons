'use client'
import { Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function BasicPlan (){
  const router = useRouter();

    const handlePlanSelect = (priceId: string, plan: string) => {
    localStorage.setItem('selectedPriceId', priceId);
    localStorage.setItem('selectedPlan', plan);
    router.push('/sign-up');
    };

return(

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
      </div>

)
}