import { useRouter } from "next/navigation";
import { Business } from "../types/business";

interface BusinessCardProps {
  business: Business;
}

export default function BusinessCard({ business }: BusinessCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/businesses/${business.slug}`);
  };

  return (
    <div
      onClick={handleClick}
      className="cursor-pointer border border-gray-200 text-[#7DA195] rounded-lg shadow-md p-4 hover:shadow-lg transition"
    >
      <div className="flex flex-col items-center text-center">
        <img
          src={business.image || '/placeholder.png'}
          alt={business.name}
          className="object-cover w-full h-40 rounded-md mb-4"
        />
        <h3 className="text-lg font-semibold text-[#7DA195]">{business.name}</h3>

        {/* Display each category as a tag */}
        {Array.isArray(business.categories) && business.categories.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mt-2 mb-2">
            {business.categories.map((category) => (
              <span
                key={category}
                className="bg-[#7DA195] text-white text-xs font-medium px-2 py-1 rounded-full"
              >
                {category}
              </span>
            ))}
          </div>
        )}

        <p className="text-sm text-gray-600">{business.address}</p>
        <p className="text-sm text-gray-600">{business.city}</p>
        <p className="text-sm text-gray-600">{business.state}</p>
      </div>
    </div>
  );
}
