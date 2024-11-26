'use client'

import { Suspense } from 'react'
import dynamic from 'next/dynamic'

const ThreeScene = dynamic(() => import('./scene'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-background/50 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900" />
        <p className="text-sm text-gray-600">Loading 3D Scene...</p>
      </div>
    </div>
  ),
})

export function ThreeSceneWrapper() {
  return (
    <div className="hidden md:block fixed top-0 right-0 w-1/2 h-screen">
      <Suspense fallback={null}>
        <ThreeScene />
      </Suspense>
    </div>
  )
}
