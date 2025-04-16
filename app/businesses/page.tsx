'use client'
import { useState } from "react";
import BusinessCard from "../../components/businessCard";
import businessesData from "../../data/businesses.json";
import { Business } from "../../types/business";

const ITEMS_PER_PAGE = 15;

export default function BusinessDirectory() {
  const [currentPage, setCurrentPage] = useState(1);

  // Sort businesses alphabetically
  const sortedBusinesses = businessesData.sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  // Calculate total pages
  const totalPages = Math.ceil(sortedBusinesses.length / ITEMS_PER_PAGE);

  // Get businesses for the current page
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentBusinesses = sortedBusinesses.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-center text-[#7DA195] mb-6">
        Business Directory
      </h1>

      {/* Business List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {currentBusinesses.map((business) => (
          <BusinessCard key={business.id} business={business} />
        ))}
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-center mt-8 space-x-4">
        <button
          className={`px-4 py-2 rounded-md ${
            currentPage === 1 ? "bg-[#4C7C59] cursor-not-allowed" : "bg-[#4C7C59] text-white"
          }`}
          onClick={() => setCurrentPage((prev) => prev - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </button>

        <span className="text-lg text-[#7DA195] font-semibold">{`Page ${currentPage} of ${totalPages}`}</span>

        <button
          className={`px-4 py-2 rounded-md ${
            currentPage === totalPages ? "bg-gray-300 cursor-not-allowed" : "bg-[#4C7C59] text-white"
          }`}
          onClick={() => setCurrentPage((prev) => prev + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
}