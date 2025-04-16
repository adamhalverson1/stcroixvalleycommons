'use client'
import { useState } from "react";
import { useRouter } from "next/navigation";

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function SearchBar({ searchQuery, setSearchQuery }: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState(searchQuery);

  const handleSearch = () => {
    if (query.trim() !== "") {
      router.push(`/search-results?query=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="flex items-center gap-4 w-full max-w-lg mx-auto">
      <input
        type="text"
        placeholder="Search businesses..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button 
        onClick={handleSearch} 
        className="px-4 py-3 bg-[#4C7C59] text-white font-semibold rounded-md hover:bg-[#7DA195] transition"
      >
        Search
      </button>
    </div>
  );
}