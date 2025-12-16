import { NextRequest, NextResponse } from 'next/server'
import { mkdir, readFile, writeFile } from 'fs/promises'
import { join, resolve } from 'path'

// We are just using the filesystem to store assets
// In production, you should use a proper storage service like Vercel Blob
const DIR = resolve('./.assets')

// Sanitize asset ID to prevent path traversal attacks
function sanitizeAssetId(id: string): string {
    return id.replace(/[^a-zA-Z0-9_.-]/g, '_')
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: rawId } = await params
        const id = sanitizeAssetId(rawId)
        await mkdir(DIR, { recursive: true })
        
        // Get the raw body as ArrayBuffer
        const arrayBuffer = await request.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        
        await writeFile(join(DIR, id), buffer)
        
        return NextResponse.json({ ok: true })
    } catch (error) {
        console.error('Error storing asset:', error)
        return NextResponse.json(
            { error: 'Failed to store asset' },
            { status: 500 }
        )
    }
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: rawId } = await params
        const id = sanitizeAssetId(rawId)
        const data = await readFile(join(DIR, id))
        
        return new NextResponse(data, {
            headers: {
                'Content-Type': 'application/octet-stream',
            },
        })
    } catch (error) {
        console.error('Error loading asset:', error)
        return NextResponse.json(
            { error: 'Asset not found' },
            { status: 404 }
        )
    }
}
