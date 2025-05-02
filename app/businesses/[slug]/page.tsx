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

    if (slug) {
      fetchBusiness();
    }
  }, [slug]);

  if (loading) {
    return <div className="min-h-screen bg-gray-100 p-6 text-center text-[#7DA195]">Loading...</div>;
  }

  if (!business) {
    return <div className="min-h-screen bg-gray-100 p-6 text-center text-red-500 mt-10">Business not found</div>;
  }

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
        {business.image && (
          <img 
            src={business.image} 
            alt={business.name} 
            className="w-sm h-sm object-cover flex justify-center rounded-md"
          />
        )}
        <h1 className="text-3xl font-bold mt-4">{business.name}</h1>
        <p className="text-lg text-gray-700 mt-2">{business.description}</p>
        <p className="text-sm text-gray-600 mt-2">
          <strong>Category:</strong> {business.category}
        </p>
        <p className="text-sm text-gray-600 mt-2">
          <strong>Location:</strong> {business.address}
        </p>
      </div>
    </div>
  );
}
