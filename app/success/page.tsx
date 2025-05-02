'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SuccessPage() {
  const router = useRouter()

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.push('/dashboard')
    }, 3000)

    return () => clearTimeout(timeout)
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white shadow-xl rounded-2xl p-8 text-center space-y-4">
        <h1 className="text-2xl font-semibold text-green-700">🎉 Business Registered!</h1>
        <p className="text-gray-700">You've successfully registered your business with <strong>St. Croix Commons</strong>.</p>
        <p className="text-gray-600 text-sm">Redirecting you to your dashboard...</p>
        <div className="w-full h-1 bg-gray-200 rounded overflow-hidden">
          <div className="h-full bg-green-500 animate-pulse transition-all duration-3000"></div>
        </div>
      </div>
    </div>
  )
}
