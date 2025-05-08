'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

type Props = {
  selectedCity: string;
  onCityChange: (city: string) => void;
};

export default function CityList({ selectedCity, onCityChange }: Props) {
  const [cities, setCities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCities = async () => {
      const snapshot = await getDocs(collection(db, 'businesses'));
      const allCities = snapshot.docs
        .map((doc) => doc.data().city) // ✅ was "cities", changed to "city"
        .filter(
          (city): city is string =>
            typeof city === 'string' && city.trim() !== ''
        );

      const uniqueCities = Array.from(new Set(allCities)).sort();
      setCities(uniqueCities);
      setLoading(false);
    };

    fetchCities();
  }, []);

  if (loading) return <p>Loading Cities...</p>;

  return (
    <div className="mb-4">
      <h3 className="mb-2 font-semibold text-gray-700">Browse by City</h3>
      <ul className="flex flex-wrap gap-2">
        <li>
          <button
            onClick={() => onCityChange('')}
            className={`px-4 py-2 rounded border ${
              selectedCity === ''
                ? 'bg-[#4C7C59] text-white'
                : 'bg-white text-gray-800 border-gray-300'
            } hover:bg-[#4C7C59] hover:text-white transition`}
          >
            All Cities
          </button>
        </li>

        {cities.map((city) => (
          <li key={city}>
            <button
              onClick={() => onCityChange(city)}
              className={`px-4 py-2 rounded border ${
                selectedCity === city
                  ? 'bg-[#4C7C59]  text-white'
                  : 'bg-white text-gray-800 border-gray-300'
              } hover:bg-[#4C7C59]  hover:text-white transition`}
            >
              {city}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
