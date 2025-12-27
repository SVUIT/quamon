'use client'

import dynamic from 'next/dynamic'

// Import the Home component from the pages directory
const Home = dynamic(
  () => import('../../../src/pages/Home'),
  { ssr: false, loading: () => <div>Loading...</div> }
)

export function ClientOnly() {
  return <Home />
}