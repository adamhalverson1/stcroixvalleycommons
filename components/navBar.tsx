'use client'
import { useState } from "react";
import Link from "next/link";
import { FiMenu, FiX } from "react-icons/fi";
import { UserButton, SignedIn, SignedOut } from "@clerk/nextjs";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-[#2C3E50] shadow-md">
      <div className="container mx-auto flex justify-between items-center p-4">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-[#4C7C59]">
          St Croix Valley Commons
        </Link>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-gray-700"
        >
          {isOpen ? <FiX size={28} /> : <FiMenu size={28} />}
        </button>

        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-6">
          <Link href="/" className="text-white font-bold hover:text-[#7DA195]">Home</Link>
          <Link href="/businesses" className="text-white font-bold hover:text-[#7DA195]">Business Directory</Link>
          <Link href="/events" className="text-white font-bold hover:text-[#7DA195]">Events</Link>
          <SignedOut>
            <Link href="/login" className="text-white font-bold hover:text-[#7DA195]">Business Sign In</Link>
            <Link href="/register-business" className="text-white font-bold hover:text-[#7DA195]">Business Sign Up</Link>
          </SignedOut>
          <SignedIn>
            <Link href="/dashboard" className="mr-4">Dashboard</Link>
            <UserButton />
          </SignedIn>          
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <div className="md:hidden bg-white shadow-md p-4">
            <Link href="/" className="text-white font-bold hover:text-[#7DA195]">Home</Link>
            <Link href="/businesses" className="text-white font-bold hover:text-[#7DA195]">Business Directory</Link>
            <Link href="/events" className="text-white font-bold hover:text-[#7DA195]">Events</Link>
            <SignedOut>
                <Link href="/login" className="mr-4">Business Sign In</Link>
                <Link href="/register-business">Business Sign Up</Link>
            </SignedOut>
            <SignedIn>
                <Link href="/dashboard" className="mr-4">Dashboard</Link>
                <UserButton />
            </SignedIn>          
        </div>
      )}
    </nav>
  );
}