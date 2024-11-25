'use client'

import dynamic from 'next/dynamic'

const ThreeScene = dynamic(() => import('./scene'), {
  ssr: false,
})

export function ThreeSceneWrapper() {
  return (
    <div className="hidden md:block fixed top-0 right-0 w-1/2 h-screen">
      <ThreeScene />
    </div>
  )
}
