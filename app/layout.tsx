import type { Metadata, Viewport } from 'next'
import './globals.css'
import React from 'react'
import { Analytics } from '@vercel/analytics/next'

export const metadata: Metadata = {
    title: 'Draw',
    description: 'A simple multiplayer whiteboard',
}

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover',
}

export default function RootLayout( {
                                        children,
                                    }: Readonly<{
    children: React.ReactNode;
}> ) {
    return (
        <html lang="en">
        <Analytics/>
        <body className="antialiased">{children}</body>
        </html>
    )
}
