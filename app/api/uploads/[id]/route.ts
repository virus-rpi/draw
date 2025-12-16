import { NextRequest, NextResponse } from 'next/server'
import { put, head } from '@vercel/blob'

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
        
        // Get the raw body as ArrayBuffer
        const arrayBuffer = await request.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        
        // Upload to Vercel Blob with public access
        const blob = await put(id, buffer, {
            access: 'public',
            addRandomSuffix: false, // Use exact filename
        })
        
        return NextResponse.json({ 
            ok: true,
            url: blob.url 
        })
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
        
        // Check if blob exists
        const blobInfo = await head(`https://blob.vercel-storage.com/${id}`)
        
        if (!blobInfo) {
            return NextResponse.json(
                { error: 'Asset not found' },
                { status: 404 }
            )
        }
        
        // Redirect to the Vercel Blob URL for direct access
        return NextResponse.redirect(blobInfo.url)
    } catch (error) {
        console.error('Error loading asset:', error)
        return NextResponse.json(
            { error: 'Asset not found' },
            { status: 404 }
        )
    }
}
