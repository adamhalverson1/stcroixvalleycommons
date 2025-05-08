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
          className="object-cover w-sm h-sm rounded-md mb-4"
        />
        <h3 className="text-lg font-semibold text-[#7DA195]">{business.name}</h3>
        <p className="text-sm text-gray-600"><strong>{business.category}</strong></p>
        <p className="text-sm text-gray-600">{business.address}</p>
        <p className="text-sm text-gray-600">{business.city}</p>
        <p className="text-sm text-gray-600">{business.state}</p>
      </div>
    </div>
  );
}
