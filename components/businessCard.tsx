import { useRouter } from "next/navigation";
import { Business } from "../types/business";

interface BusinessCardProps {
  business: Business;
}

export default function BusinessCard({ business }: BusinessCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/businesses/${business.slug}`); // Use slug for routing
  };

  return (
    <div 
      onClick={handleClick}
      className="cursor-pointer border border-gray-200 text-[#7DA195] rounded-lg shadow-md p-4 hover:shadow-lg transition"
    >
      <img 
        src={business.image || '/placeholder.jpg'} 
        alt={business.name} 
        className="w-full h-40 object-cover rounded-md"
      />
      <h3 className="text-lg font-semibold mt-2">{business.name}</h3>
      <p className="text-sm text-gray-600">{business.category}</p>
      <p className="text-sm text-gray-500">{business.address}</p>
    </div>
  );
}
