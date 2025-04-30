import BusinessRegistrationForm from "@/components/BusinessRegistrationForm";

export default function RegisterBusinessPage() {
  return (
    <div className="bg-gray-100 min-h-screen px-6 py-8" >
      <h1 className="text-3xl font-bold text-center text-[#4C7C59] mb-6">Register Your Business</h1>
      <BusinessRegistrationForm />
    </div>
  );
}
