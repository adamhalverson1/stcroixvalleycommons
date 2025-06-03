'use client'
import { useState, useEffect } from "react";
import Head from "next/head";
import BusinessCard from "../components/businessCard";
import SearchBar from "../components/searchBar";

import { Business } from "../types/business";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase"; // adjust path to your firebase config

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [allBusinesses, setAllBusinesses] = useState<Business[]>([]);
  const [featuredBusinesses, setFeaturedBusinesses] = useState<Business[]>([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Get 15 random businesses
  const getRandomBusinesses = (businessList: Business[]) => {
    const shuffled = [...businessList].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 15);
  };

  // Fetch businesses from Firestore
  const fetchBusinesses = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "businesses"));
      const businesses: Business[] = querySnapshot.docs
        .map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            image: data.image || data.imageUrl || '',
          };
        })
        .filter((b: any) => b.subscriptionStatus === "active" && b.plan === "featured") as Business[];

      setAllBusinesses(businesses);
      setFeaturedBusinesses(getRandomBusinesses(businesses));
    } catch (error) {
      console.error("Error fetching businesses:", error);
    }
  };

  // Fetch once on mount
  useEffect(() => {
    fetchBusinesses();
  }, []);

  // Rotate featured businesses every 30 seconds
  useEffect(() => {
    if (allBusinesses.length === 0) return;

    const interval = setInterval(() => {
      setFeaturedBusinesses(getRandomBusinesses(allBusinesses));
    }, 30000);

    return () => clearInterval(interval);
  }, [allBusinesses]);

  return (
    <>
      <Head>
        <title>Business Directory</title>
      </Head>

      <main className="bg-gray-100 min-h-screen px-6 py-8">
        <h1 className="text-3xl font-bold text-center text-[#7DA195] mb-6">
          Find Local Businesses
        </h1>

        {/* Search Bar */}
        <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />


        {/* Featured Businesses */}
        <section className="mt-8">
          <h2 className="text-xl font-semibold text-[#7DA195] mb-4 flex justify-center">Featured Businesses</h2>
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
