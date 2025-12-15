'use client'

import dynamic from 'next/dynamic'

const TldrawEditor = dynamic(() => import('@/components/TldrawEditor'), {
    ssr: false,
})

export default function App() {
    return <TldrawEditor/>
}
