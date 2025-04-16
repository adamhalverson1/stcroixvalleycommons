'use client'
import { useState, useEffect } from "react";
import Head from "next/head";
import BusinessCard from "../components/businessCard";
import SearchBar from "../components/searchBar";
import businessesData from "../data/businesses.json";
import { Business } from "../types/business";


export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [featuredBusinesses, setFeaturedBusinesses] = useState<Business[]>([]);

  // Function to get 15 random businesses
  const getRandomBusinesses = () => {
    const shuffled = [...businessesData].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 15);
  };

  // Rotate featured businesses every 30 seconds
  useEffect(() => {
    setFeaturedBusinesses(getRandomBusinesses());

    const interval = setInterval(() => {
      setFeaturedBusinesses(getRandomBusinesses());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Head>
        <title>Business Directory</title>
      </Head>

      <main className="bg-gray-100 min-h-screen px-6 py-8">
        <h1 className="text-3xl font-bold text-center text-[#7DA195]  mb-6">
          Find Local Businesses
        </h1>

        {/* Search Bar */}
        <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

        {/* Featured Businesses */}
        <section className="mt-8">
          <h2 className="text-xl font-semibold text-[#7DA195] mb-4">Featured Businesses</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {featuredBusinesses.map((business) => (
              <BusinessCard key={business.id} business={business} />
            ))}
          </div>
        </section>
      </main>
    </>
  );
}