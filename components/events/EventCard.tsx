'use client';

import { useRouter } from 'next/navigation';

type Props = {
  event: {
    id: string;
    title: string;
    description: string;
    date: string;
    time: string;
    location: string;
    imageUrl?: string;
    isFeatured: boolean;
    slug: string;
  };
};

export default function EventCard({ event }: Props) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/events/${event.slug}`);
  };

  return (
    <div
      onClick={handleClick}
      className="cursor-pointer border rounded-lg shadow-md p-4 bg-white hover:shadow-lg transition"
    >
      {event.imageUrl && (
        <img
          src={event.imageUrl}
          alt={event.title}
          className="w-full h-40 object-cover rounded mb-3"
        />
      )}
      <h3 className="text-lg font-semibold text-[#4C7C59]">{event.title}</h3>
      <p className="text-sm text-gray-600">{event.description}</p>
      <p className="text-sm text-gray-500 mt-1">
        {event.date} at {event.time}
      </p>
      <p className="text-sm text-gray-500">{event.location}</p>
      {event.isFeatured && (
        <span className="inline-block mt-2 text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
          ★ Featured
        </span>
      )}
    </div>
  );
}
