'use client';

import Link from 'next/link';
import { Sparkles, Star } from 'lucide-react';

export default function WhyAdvertisePage() {
  return (
    <div className='bg-gray-100 min-h-screen px-6'>
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-4xl font-bold text-[#4C7C59] mb-6">Why Advertise with St. Croix Valley Commons?</h1>

      <p className="text-gray-700 text-lg mb-4">
        St. Croix Valley Commons is the go-to online destination for locals and visitors looking to discover small businesses, events, and services in our region. If you're a business owner, there's no better place to connect with your community.
      </p>

      <h2 className="text-2xl font-semibold text-[#4C7C59] mt-8 mb-3">👥 Reach Local Customers</h2>
      <p className="text-gray-700 mb-4">
        Our platform is hyper-local, meaning your business is seen by people in your area who are actively searching for what you offer—no wasted impressions or broad targeting.
      </p>

      <h2 className="text-2xl font-semibold text-[#4C7C59] mt-8 mb-3">💼 Show Up Where It Matters</h2>
      <p className="text-gray-700 mb-4">
        Whether you're a boutique shop in Hudson or a service provider in New Richmond, our directory ensures you’re easily discoverable by city, category, and keyword search.
      </p>

      <h2 className="text-2xl font-semibold text-[#4C7C59] mt-8 mb-3">📢 Promote Events & Sales</h2>
      <p className="text-gray-700 mb-4">
        Featured businesses can post unlimited promotions and events to our community bulletin. Let people know what’s happening at your business and drive real foot traffic.
      </p>

      <h2 className="text-2xl font-semibold text-[#4C7C59] mt-8 mb-3">🔒 Hassle-Free Management</h2>
      <p className="text-gray-700 mb-4">
        Easily update your business profile, images, contact info, and promotions through your dashboard anytime—no tech skills required.
      </p>

      <h2 className="text-2xl font-semibold text-[#4C7C59] mt-8 mb-3">📈 Affordable & Effective</h2>
      <p className="text-gray-700 mb-6">
        Starting at just $10/month, our plans are built to offer high value without the high cost. Choose the right plan for your needs:
      </p>

    {/* Pricing Plans */}
    <div className="grid gap-8 sm:grid-cols-2 w-full">
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
      </div>

      {/* Featured Plan */}
      <div className="bg-white border-2 border-[#C4A484] rounded-2xl shadow-md p-6 flex flex-col items-center text-center hover:shadow-lg transition">
        <Star className="text-[#C4A484] w-10 h-10 mb-4" />
        <h2 className="text-2xl font-semibold text-[#305D74]">Featured Plan</h2>
        <p className="text-[#4A4A4A] mt-2 mb-4">
          Designed for businesses ready to boost visibility and drive more leads.
        </p>
        <ul className="text-sm text-gray-700 space-y-2 text-left">
          <li><strong>Includes everything in Basic, plus:</strong></li>
          <li>✔ Priority placement in search results and category pages</li>
          <li>✔ Optional direct messaging or inquiry form</li>
          <li>✔ Choose up to 3 categories for your business</li>
          <li>✔ Upload attachments (menus, brochures, etc.)</li>
          <li>✔ 1 Featured Event per month</li>
          <li>✔ 1 Featured Coupon</li>
        </ul>
        <p className="text-xl font-bold mt-6 text-[#C4A484]">$25/month</p>
      </div>
      </div>

      <div className="mt-12 text-center">
        <Link href="/register-business">
          <button className="bg-[#4C7C59] text-white px-6 py-3 rounded-md text-lg hover:bg-[#3b6447] transition">
            Get Started Today
          </button>
        </Link>
        <p className="text-sm text-gray-500 mt-2">No commitment. Cancel anytime.</p>
      </div>
    </div>
    </div>
  );
}
