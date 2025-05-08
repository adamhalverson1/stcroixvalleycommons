'use client';
import { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';

import BusinessCard from '../../components/businessCard';
import { Business } from '../../types/business';
import SearchBar from '@/components/searchBar';
import CityList from '@/components/CityFilter'; // Updated component: click-to-filter
import CategoryList from '@/components/CategoryFilter'; // Updated component: click-to-filter

const ITEMS_PER_PAGE = 15;

export default function BusinessDirectory() {
  const [currentPage, setCurrentPage] = useState(1);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const businessesRef = collection(db, 'businesses');
        const q = query(businessesRef, where('subscriptionStatus', '==', 'active'));
        const snapshot = await getDocs(q);

        const activeBusinesses = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            image: data.image || data.imageUrl || '',
          };
        }) as Business[];

        const sorted = activeBusinesses.sort((a, b) =>
          a.name.localeCompare(b.name)
        );

        setBusinesses(sorted);
      } catch (error) {
        console.error('Error fetching businesses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinesses();
  }, []);

  // 🔍 Apply filters before pagination
  const filteredBusinesses = businesses.filter((biz) => {
    const matchesSearch = biz.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCity = selectedCity ? biz.city === selectedCity : true;
    const matchesCategory = selectedCategory ? biz.category === selectedCategory : true;
    return matchesSearch && matchesCity && matchesCategory;
  });

  const totalPages = Math.ceil(filteredBusinesses.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentBusinesses = filteredBusinesses.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-center text-[#7DA195] mb-6">
        Business Directory
      </h1>

      <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <div className="my-4">
        <CityList selectedCity={selectedCity} onCityChange={setSelectedCity} />
        <CategoryList selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory} />
      </div>

      {loading ? (
        <p className="min-h-screen bg-gray-100 p-6 mt-8 text-center text-[#7DA195]">Loading businesses...</p>
      ) : (
        <>
          {filteredBusinesses.length === 0 ? (
            <p className="text-center text-gray-600 mt-10">No businesses match your filters.</p>
          ) : (
            <>
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {currentBusinesses.map((business) => (
                  <BusinessCard key={business.id} business={business} />
                ))}
              </div>

              <div className="flex justify-center mt-8 space-x-4">
                <button
                  className={`px-4 py-2 rounded-md ${
                    currentPage === 1
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-[#4C7C59] text-white'
                  }`}
                  onClick={() => setCurrentPage((prev) => prev - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>

                <span className="text-lg text-[#7DA195] font-semibold">{`Page ${currentPage} of ${totalPages}`}</span>

                <button
                  className={`px-4 py-2 rounded-md ${
                    currentPage === totalPages
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-[#4C7C59] text-white'
                  }`}
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
