'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Business } from '@/types/business';

export default function BusinessDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        const docRef = doc(db, 'businesses', slug);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setBusiness({
            ...data,
            id: docSnap.id,
            image: data.image || data.imageUrl || '',
          } as Business);
        } else {
          setBusiness(null);
        }
      } catch (error) {
        console.error('Error fetching business:', error);
        setBusiness(null);
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchBusiness();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 text-[#7DA195] text-xl font-medium">
        Loading...
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 text-red-500 text-xl font-semibold">
        Business not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-md p-6 sm:p-10">
        {/* Image */}
        {business.image && (
          <div className="flex justify-center">
            <img
              src={business.image}
              alt={business.name}
              className="w-full max-w-lg rounded-lg object-cover shadow"
            />
          </div>
        )}

        {/* Name & Description */}
        <h1 className="text-3xl sm:text-4xl font-bold text-center text-[#4C7C59] mt-6">
          {business.name}
        </h1>
        {business.description && (
          <p className="text-md sm:text-lg text-center text-gray-700 mt-4">
            {business.description}
          </p>
        )}

        {/* Details */}
        <div className="mt-8 grid sm:grid-cols-2 gap-4 text-gray-700 text-sm">
          {business.category && (
            <Detail label="Category" value={business.category} />
          )}
          {business.address && (
            <Detail label="Address" value={business.address} />
          )}
          {business.city && (
            <Detail label="City" value={business.city} />
          )}
          {business.state && (
            <Detail label="State" value={business.state} />
          )}
          {business.phone && (
            <Detail label="Phone" value={business.phone} />
          )}
          {business.serviceArea && (
            <Detail label="Service Area" value={business.serviceArea} />
          )}
          {business.email && (
            <Detail label="Email" value={<a href={`mailto:${business.email}`} className="text-blue-600 hover:underline">{business.email}</a>} />
          )}
          {business.website && (
            <Detail label="Website" value={<a href={business.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{business.website}</a>} />
          )}
          {business.Facebook && (
            <Detail label="Facebook" value={<a href={business.Facebook} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{business.Facebook}</a>} />
          )}
          {business.Twitter && (
            <Detail label="Twitter" value={<a href={business.Twitter} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{business.Twitter}</a>} />
          )}
          {business.Instagram && (
            <Detail label="Instagram" value={<a href={business.Instagram} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{business.Instagram}</a>} />
          )}
        </div>

        {/* Hours */}
        {business.hours && typeof business.hours === 'object' && (
          <div className="mt-10">
            <h2 className="text-xl font-semibold text-[#4C7C59] mb-4">Business Hours</h2>
            <ul className="divide-y divide-gray-200 text-sm text-[#4C7C59]">
              {Object.entries(business.hours).map(([day, time]: [string, any]) => (
                <li key={day} className="flex justify-between py-2">
                  <span className="font-medium">{day}</span>
                  <span>
                    {time?.open && time?.close
                      ? `${time.open} - ${time.close}`
                      : 'Closed'}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-gray-500 font-medium">{label}</p>
      <p className="mt-1">{value}</p>
    </div>
  );
}
