'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiMenu, FiX } from 'react-icons/fi';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
    });
    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/');
  };

  return (
    <>
      {/* Logo section */}
      <div className="bg-gray-100 py-4 flex justify-center border-b">
        <Link href="/" className="block">
          <Image
            src="/stcroixvalleycommons.png"
            alt="St Croix Valley Commons Logo"
            width={400}
            height={100}
            className="object-contain"
            priority
          />
        </Link>
      </div>

      {/* Navbar section */}
      <nav className="bg-[#2C3E50] shadow-md">
        <div className="flex justify-between items-center px-4 py-4 md:hidden">
          <button onClick={() => setIsOpen(!isOpen)} className="text-white">
            {isOpen ? <FiX size={28} /> : <FiMenu size={28} />}
          </button>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden bg-white shadow-md p-4 space-y-2">
            <Link href="/" className="block text-[#2C3E50] font-bold hover:text-[#7DA195]">Home</Link>
            <Link href="/businesses" className="block text-[#2C3E50] font-bold hover:text-[#7DA195]">Business Directory</Link>
            <Link href="/events" className="block text-[#2C3E50] font-bold hover:text-[#7DA195]">Events</Link>
            <Link href="/coupons" className="block text-[#2C3E50] font-bold hover:text-[#7DA195]">Coupons</Link>
            <Link href="/why-advertise" className="block text-[#2C3E50] font-bold hover:text-[#7DA195]">Why Advertise Here?</Link>

            {!isAuthenticated ? (
              <>
                <Link href="/login" className="block text-[#2C3E50] font-bold hover:text-[#7DA195]">Business Sign In</Link>
                <Link href="/select-plan" className="block text-[#2C3E50] font-bold hover:text-[#7DA195]">Business Sign Up</Link>
              </>
            ) : (
              <>
                <Link href="/dashboard" className="block text-[#2C3E50] font-bold hover:text-[#7DA195]">Dashboard</Link>
                <button
                  onClick={handleSignOut}
                  className="block text-[#2C3E50] font-bold hover:text-[#7DA195] w-full text-left"
                >
                  Sign Out
                </button>
              </>
            )}
          </div>
        )}

        {/* Desktop menu */}
        <div className="hidden md:flex justify-center items-center space-x-8 px-4 py-4">
          <Link href="/" className="text-white font-bold hover:text-[#7DA195]">Home</Link>
          <Link href="/businesses" className="text-white font-bold hover:text-[#7DA195]">Business Directory</Link>
          <Link href="/events" className="text-white font-bold hover:text-[#7DA195]">Events</Link>
          <Link href="/coupons" className="text-white font-bold hover:text-[#7DA195]">Coupons</Link>
          <Link href="/why-advertise" className="text-white font-bold hover:text-[#7DA195]">Why Advertise Here?</Link>

          {!isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="text-white font-bold hover:text-[#7DA195] focus:outline-none"
              >
                Business Access ▾
              </button>
              {dropdownOpen && (
                <div className="absolute mt-2 w-48 bg-white rounded-md shadow-lg z-50 right-0">
                  <Link
                    href="/login"
                    className="block px-4 py-2 text-sm text-[#2C3E50] hover:bg-[#f0f0f0]"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Business Sign In
                  </Link>
                  <Link
                    href="/select-plan"
                    className="block px-4 py-2 text-sm text-[#2C3E50] hover:bg-[#f0f0f0]"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Business Sign Up
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/dashboard" className="text-white font-bold hover:text-[#7DA195]">Dashboard</Link>
              <button
                onClick={handleSignOut}
                className="text-white font-bold hover:text-[#7DA195]"
              >
                Sign Out
              </button>
            </>
          )}
        </div>
      </nav>
    </>
  );
}
