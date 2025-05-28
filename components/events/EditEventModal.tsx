'use client';

import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

type Props = {
  event: any;
  onClose: () => void;
};

export default function EditEventModal({ event, onClose }: Props) {
  const [title, setTitle] = useState(event.title);
  const [description, setDescription] = useState(event.description);
  const [date, setDate] = useState(event.date);
  const [time, setTime] = useState(event.time);
  const [location, setLocation] = useState(event.location);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await updateDoc(doc(db, 'events', event.id), {
      title,
      description,
      date,
      time,
      location,
    });
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0  bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-lg">
        <h3 className="text-lg font-semibold mb-4 text-[#4C7C59]">Edit Event</h3>

        <input
          type="text"
          className="w-full p-2 border mb-2 rounded text-black"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          className="w-full p-2 border mb-2 rounded text-black"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className="flex gap-2">
          <input
            type="date"
            className="w-1/2 p-2 border rounded text-black"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <input
            type="time"
            className="w-1/2 p-2 border rounded text-black"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </div>

        <input
          type="text"
          className="w-full p-2 border mt-2 rounded text-black"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />

        <div className="flex justify-end space-x-4 mt-4">
          <button
            onClick={onClose}
            className="text-gray-600 hover:underline"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#4C7C59] text-white px-4 py-2 rounded hover:bg-[#3a6349]"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
