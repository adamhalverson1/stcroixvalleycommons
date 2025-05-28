'use client';

import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import EditEventModal from './EditEventModal';

type Props = {
  businessId: string;
};

export default function EventList({ businessId }: Props) {
  const [events, setEvents] = useState<any[]>([]);
  const [editingEvent, setEditingEvent] = useState<any | null>(null);

  const fetchEvents = async () => {
    const q = query(collection(db, 'events'), where('businessId', '==', businessId));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setEvents(data);
  };

  const deleteEvent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    await deleteDoc(doc(db, 'events', id));
    fetchEvents();
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <div className="mt-8 space-y-4">
      <h2 className="text-xl font-semibold text-[#4C7C59]">Your Events</h2>

      {events.length === 0 && <p className="text-gray-600">No events posted yet.</p>}

      {events.map((event) => (
        <div key={event.id} className="border rounded p-4 shadow-sm bg-white">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-bold">{event.title}</h3>
              <p>{event.description}</p>
              <p className="text-sm text-gray-500">{event.date} at {event.time}</p>
              <p className="text-sm text-gray-500">{event.location}</p>
              {event.isFeatured && (
                <span className="text-sm text-yellow-600 font-semibold">★ Featured Event</span>
              )}
            </div>

            <div className="space-x-2">
              <button
                onClick={() => setEditingEvent(event)}
                className="text-blue-600 hover:underline text-sm"
              >
                Edit
              </button>
              <button
                onClick={() => deleteEvent(event.id)}
                className="text-red-600 hover:underline text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}

      {editingEvent && (
        <EditEventModal
          event={editingEvent}
          onClose={() => {
            setEditingEvent(null);
            fetchEvents(); // refresh after edit
          }}
        />
      )}
    </div>
  );
}
