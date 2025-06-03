'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

type Props = {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
};

export default function CategoryList({ selectedCategory, onCategoryChange }: Props) {
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      const snapshot = await getDocs(collection(db, 'businesses'));

      const allCategories = snapshot.docs
        .map((doc) => doc.data().categories)
        .filter(Array.isArray) // ensure it's an array
        .flat()
        .filter(
          (category): category is string =>
            typeof category === 'string' && category.trim() !== ''
        );

      const uniqueCategories = Array.from(new Set(allCategories)).sort();
      setCategories(uniqueCategories);
      setLoading(false);
    };

    fetchCategories();
  }, []);

  if (loading) return <p>Loading categories...</p>;

  return (
    <div className="mb-4">
      <h3 className="mb-2 font-semibold text-gray-700">Browse by Category</h3>
      <ul className="flex flex-wrap gap-2 mb-2">
        {categories.map((category) => (
          <li key={category}>
            <button
              onClick={() => onCategoryChange(category)}
              className={`px-4 py-2 rounded border ${
                selectedCategory === category
                  ? 'bg-[#4C7C59] text-white'
                  : 'bg-white text-gray-800 border-gray-300'
              } hover:bg-[#4C7C59] hover:text-white transition`}
            >
              {category}
            </button>
          </li>
        ))}
      </ul>

      {/* Clear Filters Button */}
      {selectedCategory && (
        <button
          onClick={() => onCategoryChange('')}
          className="mt-2 px-4 py-2 rounded bg-gray-300 text-gray-800 hover:bg-gray-400 transition"
        >
          Clear Filters
        </button>
      )}
    </div>
  );
}
