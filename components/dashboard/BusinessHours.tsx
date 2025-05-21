'use client';

import { useState, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const daysOfWeek = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export function BusinessHours({ business, setBusiness }) {
  const [hours, setHours] = useState({});

  useEffect(() => {
    if (business?.hours) {
      setHours(business.hours);
    } else {
      // Initialize hours for all days if missing
      const initialHours = {};
      daysOfWeek.forEach((day) => {
        initialHours[day] = { open: '', close: '' };
      });
      setHours(initialHours);
    }
  }, [business]);

  const handleHoursChange = (day, type, value) => {
    setHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [type]: value,
      },
    }));
  };

  const handleSave = async () => {
    await updateDoc(doc(db, 'businesses', business.id), {
      hours,
    });

    setBusiness((prev) => ({ ...prev, hours }));
    alert('Business hours updated');
  };

  return (
    <div className="border rounded-lg p-4 bg-white">
      <h3 className="text-lg font-semibold text-[#2C3E50] mb-4 text-center">Business Hours</h3>

      <div className="space-y-2">
        {daysOfWeek.map((day) => (
          <div key={day} className="flex items-center justify-between gap-4">
            <span className="w-1/4 font-medium text-[#2C3E50]">{day}</span>
            <input
              type="time"
              value={hours[day]?.open || ''}
              onChange={(e) => handleHoursChange(day, 'open', e.target.value)}
              className="w-full border rounded px-2 py-1 text-[#2C3E50]"
              required
            />
            <span className="text-sm text-[#2C3E50]">to</span>
            <input
              type="time"
              value={hours[day]?.close || ''}
              onChange={(e) => handleHoursChange(day, 'close', e.target.value)}
              className="w-full border rounded px-2 py-1 text-[#2C3E50]"
              required
            />
          </div>
        ))}
      </div>

      <div className="mt-4 text-center">
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-[#4C7C59] text-white rounded hover:bg-[#3b644a]"
        >
          Save Hours
        </button>
      </div>
    </div>
  );
}
