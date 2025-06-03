'use client';

import { use, useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export const runtime = 'edge'; 

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  imageUrl?: string;
  isFeatured: boolean;
  slug: string;
}

interface Params {
  params: Promise<{ slug: string }>;
}

export default function EventDetailPage({ params }: Params) {
  const { slug } = use(params); // ✅ unwrap the promise
  const router = useRouter();

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvent() {
      try {
        const snapshot = await getDocs(collection(db, 'events'));
        const foundEvent = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as Event))
          .find(e => e.slug === slug);

        if (!foundEvent) {
          router.replace('/not-found'); // simulate `notFound()`
        } else {
          setEvent(foundEvent);
        }
      } catch (error) {
        console.error('Error fetching event:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchEvent();
  }, [slug, router]);

  if (loading) {
    return <p className="text-center py-10 text-gray-600">Loading event...</p>;
  }

  if (!event) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6 sm:px-12">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-lg overflow-hidden">
        {event.imageUrl && (
          <div className="relative w-full h-72 sm:h-96">
            <Image
              src={event.imageUrl}
              alt={event.title}
              fill
              style={{ objectFit: 'cover' }}
              className="rounded-t-3xl"
              priority
            />
          </div>
        )}

        <div className="p-8 sm:p-12">
          <h1 className="text-4xl font-extrabold text-[#2C5F2D] mb-4 leading-tight">
            {event.title}
          </h1>

          {event.isFeatured && (
            <p className="inline-block bg-yellow-100 text-yellow-800 font-semibold px-3 py-1 rounded-full mb-6">
              🌟 Featured Event
            </p>
          )}

          <div className="flex flex-col sm:flex-row sm:space-x-8 mb-8 text-gray-600 text-lg font-medium">
            <p>
              <span className="font-semibold text-gray-800">Date:</span> {event.date}
            </p>
            <p>
              <span className="font-semibold text-gray-800">Time:</span> {event.time}
            </p>
            <p>
              <span className="font-semibold text-gray-800">Location:</span> {event.location}
            </p>
          </div>

          <p className="text-gray-700 text-base leading-relaxed whitespace-pre-line">
            {event.description}
          </p>
        </div>
      </div>
    </div>
  );
}
