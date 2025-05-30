'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import EventCard from '@/components/events/EventCard';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  imageUrl?: string;
  isFeatured: boolean;
  businessId: string;
  slug: string;
}

export default function EventsPage() {
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
  const [regularEvents, setRegularEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async () => {
    try {
      const eventsRef = collection(db, 'events');

      // Featured events (requires composite index)
      const featuredQuery = query(
        eventsRef,
        where('isFeatured', '==', true),
        orderBy('date', 'asc'),
        orderBy('time', 'asc')
      );
      const featuredSnapshot = await getDocs(featuredQuery);
      const featuredData = featuredSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Event[];

      // Regular events (requires composite index)
      const regularQuery = query(
        eventsRef,
        where('isFeatured', '==', false),
        orderBy('date', 'asc'),
        orderBy('time', 'asc')
      );
      const regularSnapshot = await getDocs(regularQuery);
      const regularData = regularSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Event[];

      setFeaturedEvents(featuredData);
      setRegularEvents(regularData);
    } catch (err: any) {
      console.error('Error fetching events:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 text-[#7DA195] text-xl font-medium">
        Loading events...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 text-red-500 text-xl font-semibold">
        Error loading events: {error}
        <br />
        If you see an index error, follow the link in the console to create it.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
    <div className="max-w-4xl bg-gray-100 mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center text-[#4C7C59] mb-6">Upcoming Events</h1>

      {featuredEvents.length > 0 && (
        <>
          <h2 className="text-xl font-semibold text-yellow-700 mb-4">🌟 Featured Events</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </>
      )}

      {regularEvents.length > 0 && (
        <>
          <h2 className="text-xl font-semibold text-[#4C7C59] mt-10 mb-4">All Events</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {regularEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </>
      )}

      {featuredEvents.length === 0 && regularEvents.length === 0 && (
        <p className="text-center text-gray-500 mt-10">No upcoming events found.</p>
      )}
    </div>
    </div>
  );
}
