
'use client'
import { useParams } from "next/navigation";
import businessesData from "../../../data/businesses.json";
import { Business } from "../../../types/business";

export default function BusinessDetailPage() {
  const params = useParams();
  const businessId = params?.id as string;

  const business: Business | undefined = businessesData.find(
    (b) => b.id.toString() === businessId
  );

  if (!business) {
    return <div className="text-center text-red-500 mt-10">Business not found</div>;
  }

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <img 
          src={business.image} 
          alt={business.name} 
          className="w-full h-64 object-cover rounded-md"
        />
        <h1 className="text-3xl font-bold mt-4">{business.name}</h1>
        <p className="text-lg text-gray-700 mt-2">{business.description}</p>
        <p className="text-sm text-gray-600 mt-2">
          <strong>Category:</strong> {business.category}
        </p>
        <p className="text-sm text-gray-600 mt-2">
          <strong>Location:</strong> {business.address}
        </p>
      </div>
    </div>
  );
}