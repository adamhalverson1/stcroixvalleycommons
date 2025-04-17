import React from 'react'
import Link from 'next/link'

export default function page() {
  return (
    <div>
        <h1>You Have succesfully registered your business to St Croix Commons!</h1>
        <p>You can now manage your business on the <Link href="/dashboard" className="mr-4">Business Dashboard</Link> page</p>
    </div>
  )
}
