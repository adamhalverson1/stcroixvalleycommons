'use client';

import { useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Business } from '@/types/business';
import Link from 'next/link';

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function SearchBar({ searchQuery, setSearchQuery }: SearchBarProps) {
  const [query, setQuery] = useState(searchQuery);
  const [results, setResults] = useState<Business[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const businessesRef = collection(db, 'businesses');
      const snapshot = await getDocs(businessesRef);

      const lowerQuery = query.toLowerCase();
      const filtered: Business[] = [];

      snapshot.forEach(docSnap => {
        const data = docSnap.data() as Business;
        const matches =
          data.name?.toLowerCase().includes(lowerQuery) ||
          data.category?.toLowerCase().includes(lowerQuery) ||
          data.description?.toLowerCase().includes(lowerQuery);

        if (matches) {
          filtered.push({ ...data, id: docSnap.id });
        }
      });

      setResults(filtered);
    } catch (err) {
      console.error('Error searching businesses:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 items-center w-full max-w-3xl mx-auto">
      <div className="flex items-center gap-4 w-full">
        <input
          type="text"
          placeholder="Search businesses..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
          if (e.key === 'Enter') {
          handleSearch();
        }
      }}
  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 text-black focus:ring-[#7DA195]"
/>
        <button
          onClick={handleSearch}
          className="px-4 py-3 bg-[#4C7C59] text-white font-semibold rounded-md hover:bg-[#7DA195] transition"
        >
          Search
        </button>
      </div>

      {loading && <p className="text-gray-500 mt-2">Searching...</p>}

      {results.length > 0 && (
        <div className="w-full mt-4 bg-white rounded-md shadow p-4">
          <h2 className="text-lg font-semibold mb-3 text-[#4C7C59]">Results:</h2>
          <ul className="space-y-2">
            {results.map((biz) => (
              <li key={biz.id} className="border-b pb-2">
                <Link href={`/businesses/${biz.id}`} className="block hover:text-[#7DA195]">
                  <p className="font-bold text-[#2C3E50]">{biz.name}</p>
                  <p className="text-sm text-gray-600">{biz.category}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!loading && results.length === 0 && query && (
        <p className="text-gray-500 mt-4">No results found.</p>
      )}
    </div>
  );
}
