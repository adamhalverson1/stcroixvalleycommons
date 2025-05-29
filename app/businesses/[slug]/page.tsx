'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Business } from '@/types/business';
import CouponCard from '@/components/coupons/CouponCard';

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  imageUrl?: string;
  isFeatured: boolean;
  slug: string;
}

interface Coupon {
  id: string;
  title: string;
  description: string;
  expirationDate: string;
  imageUrl?: string;
  isFeatured: boolean;
  businessId: string;
  slug: string;
}

interface Attachment {
  url: string;
  name?: string;
}

export default function BusinessDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [business, setBusiness] = useState<Business | null>(null);
  const [event, setEvent] = useState<Event | null>(null);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBusinessEventAndCoupons = async () => {
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

        const eventsQuery = query(collection(db, 'events'), where('businessId', '==', slug));
        const eventsSnap = await getDocs(eventsQuery);
        if (!eventsSnap.empty) {
          const firstEvent = eventsSnap.docs[0].data() as Event;
          firstEvent.id = eventsSnap.docs[0].id;
          setEvent(firstEvent);
        } else {
          setEvent(null);
        }

        const couponsQuery = query(collection(db, 'coupons'), where('businessId', '==', slug));
        const couponsSnap = await getDocs(couponsQuery);
        const couponsData = couponsSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Coupon[];
        setCoupons(couponsData);
      } catch (error) {
        console.error('Error fetching business, events, or coupons:', error);
        setBusiness(null);
        setEvent(null);
        setCoupons([]);
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchBusinessEventAndCoupons();
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

  const normalizedAttachments: Attachment[] =
    Array.isArray(business.attachments) &&
    business.attachments.every((a) => typeof a === 'string')
      ? (business.attachments as string[]).map((url) => ({
          url,
          name: decodeURIComponent(url.split('/').pop()?.split('?')[0] ?? 'Attachment'),
        }))
      : (business.attachments as Attachment[]);

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header */}
        <div className="bg-white rounded-2xl border-2 p-6 sm:p-10 grid md:grid-cols-2 gap-6">
          <div className="flex justify-center items-start">
            {business.image && (
              <img
                src={business.image || '/placeholder.jpg'}
                alt={business.name}
                className="w-full max-w-md rounded-xl object-cover shadow"

              />
            )}
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#4C7C59]">{business.name}</h1>
            {business.description && (
              <p className="text-md sm:text-lg text-gray-700 mt-4">{business.description}</p>
            )}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm text-gray-700">
              {Array.isArray(business.categories) && business.categories.length > 0 ? (
                <Detail
                  label="Categories"
                  value={
                    <ul className="flex flex-wrap gap-2 mt-1">
                      {business.categories.map((cat, index) => (
                        <li
                          key={index}
                          className="bg-[#4C7C59] text-white text-xs font-semibold px-3 py-1 rounded-full"
                        >
                          {cat}
                        </li>
                      ))}
                    </ul>
                  }
                />
              ) : business.category ? (
                <Detail label="Category" value={business.category} />
              ) : null}
              {business.address && <Detail label="Address" value={business.address} />}
              {business.city && <Detail label="City" value={business.city} />}
              {business.state && <Detail label="State" value={business.state} />}
              {business.phone && <Detail label="Phone" value={business.phone} />}
              {business.serviceArea && <Detail label="Service Area" value={business.serviceArea} />}
              {business.email && (
                <Detail
                  label="Email"
                  value={
                    <a href={`mailto:${business.email}`} className="text-blue-600 hover:underline">
                      {business.email}
                    </a>
                  }
                />
              )}
              {business.website && (
                <Detail
                  label="Website"
                  value={
                    <a
                      href={business.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {business.website}
                    </a>
                  }
                />
              )}
              {business.Facebook && (
                <Detail
                  label="Facebook"
                  value={
                    <a
                      href={business.Facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {business.Facebook}
                    </a>
                  }
                />
              )}
              {business.Twitter && (
                <Detail
                  label="Twitter"
                  value={
                    <a
                      href={business.Twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {business.Twitter}
                    </a>
                  }
                />
              )}
              {business.Instagram && (
                <Detail
                  label="Instagram"
                  value={
                    <a
                      href={business.Instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {business.Instagram}
                    </a>
                  }
                />
              )}
            </div>
          </div>
        </div>

        {/* Business Hours */}
        {business.hours && typeof business.hours === 'object' && (
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-[#4C7C59] mb-4">Business Hours</h2>
            <ul className="divide-y divide-gray-200 text-sm text-[#4C7C59]">
              {[
                'Sunday',
                'Monday',
                'Tuesday',
                'Wednesday',
                'Thursday',
                'Friday',
                'Saturday',
              ].map((day) => {
                const time = business.hours[day];
                return (
                  <li key={day} className="flex justify-between py-2">
                    <span className="font-medium">{day}</span>
                    <span>
                      {time?.open && time?.close ? `${time.open} - ${time.close}` : 'Closed'}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Attachments */}
        {business.plan === 'featured' &&
          normalizedAttachments &&
          normalizedAttachments.length > 0 && (
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-[#4C7C59] mb-4">Attachments</h2>
              <ul className="space-y-2 text-sm text-blue-600">
                {normalizedAttachments.map((file, index) => (
                  <li key={index}>
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      {file.name || 'Attachment'}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

        {/* Upcoming Event */}
        {event && (
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-2xl font-semibold text-[#4C7C59] mb-4">Upcoming Event</h2>
            {event.imageUrl && (
              <img
                src={event.imageUrl}
                alt={event.title}
                className="w-full max-w-2xl rounded-md object-cover mb-4"
              />
            )}
            <h3 className="text-xl font-bold text-[#4C7C59]">{event.title}</h3>
            {event.isFeatured && (
              <p className="text-yellow-700 font-semibold mb-2">🌟 Featured Event</p>
            )}
            <p className="text-gray-700 mb-1">
              <strong>Date:</strong> {event.date}
            </p>
            <p className="text-gray-700 mb-1">
              <strong>Time:</strong> {event.time}
            </p>
            <p className="text-gray-700 mb-1">
              <strong>Location:</strong> {event.location}
            </p>
            <a
              href={`/events/${event.slug}`}
              className="inline-block mt-4 px-4 py-2 bg-[#4C7C59] text-white rounded hover:bg-[#3c5a41]"
            >
              View Event Details
            </a>
          </div>
        )}

        {/* Coupons */}
        {coupons.length > 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-[#4C7C59] mb-4">Coupons</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {coupons.map((coupon) => (
                <CouponCard key={coupon.id} coupon={coupon} />
              ))}
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-500">No coupons available.</p>
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
