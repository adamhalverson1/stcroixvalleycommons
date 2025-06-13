import Link from 'next/link';
import Image from 'next/image';

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-[100dvh] bg-gray-100">
      <div className="max-w-md space-y-8 p-4 text-center">
        <div className="flex justify-center">
          <Image
          src={"/stcroixvalleycommons.png"}
          width={250}
          height={250}
          alt='St Croix Valley Commons'
          />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
          Page Not Found
        </h1>
        <p className="text-base text-gray-500">
          The page you are looking for might have been removed, had its name
          changed, or is temporarily unavailable.
        </p>
        <Link
          href="/"
          className="max-w-48 mx-auto flex justify-center py-2 px-4 border border-gray-300 rounded-full shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7DA195]"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
