import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { notFound } from 'next/navigation';
import Image from 'next/image';

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
  params: { slug: string };
}

export default async function EventDetailPage({ params }: Params) {
  const { slug } = params;

  // Fetch all events and find matching slug (Firestore limitation)
  const snapshot = await getDocs(collection(db, 'events'));
  const eventDoc = snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() } as Event))
    .find(event => event.slug === slug);

  if (!eventDoc) return notFound();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6 sm:px-12">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-lg overflow-hidden">
        {eventDoc.imageUrl && (
          <div className="relative w-full h-72 sm:h-96">
            <Image
              src={eventDoc.imageUrl}
              alt={eventDoc.title}
              fill
              style={{ objectFit: 'cover' }}
              className="rounded-t-3xl"
              priority
            />
          </div>
        )}

        <div className="p-8 sm:p-12">
          <h1 className="text-4xl font-extrabold text-[#2C5F2D] mb-4 leading-tight">
            {eventDoc.title}
          </h1>

          {eventDoc.isFeatured && (
            <p className="inline-block bg-yellow-100 text-yellow-800 font-semibold px-3 py-1 rounded-full mb-6">
              🌟 Featured Event
            </p>
          )}

          <div className="flex flex-col sm:flex-row sm:space-x-8 mb-8 text-gray-600 text-lg font-medium">
            <p>
              <span className="font-semibold text-gray-800">Date:</span> {eventDoc.date}
            </p>
            <p>
              <span className="font-semibold text-gray-800">Time:</span> {eventDoc.time}
            </p>
            <p>
              <span className="font-semibold text-gray-800">Location:</span> {eventDoc.location}
            </p>
          </div>

          <p className="text-gray-700 text-base leading-relaxed whitespace-pre-line">
            {eventDoc.description}
          </p>
        </div>
      </div>
    </div>
  );
}
