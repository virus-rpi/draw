import { NextRequest, NextResponse } from 'next/server'

function sanitizeAssetId( id: string ): string {
    return id.replace(/[^a-zA-Z0-9_.-]/g, '_')
}

const BACKEND_URL = process.env.NEXT_PUBLIC_SYNC_SERVER_URL || 'http://localhost:5858'

export async function PUT(
    request: NextRequest,
    {params}: { params: Promise<{ id: string }> },
) {
    try {
        const {id: rawId} = await params
        const id = sanitizeAssetId(rawId)
        const arrayBuffer = await request.arrayBuffer()
        const response = await fetch(`${BACKEND_URL}/uploads/${id}`, {
            method: 'PUT',
            body: arrayBuffer,
            headers: {
                'Content-Type': request.headers.get('Content-Type') || 'application/octet-stream',
            },
        })

        if (!response.ok) {
            throw new Error(`Backend upload failed: ${response.statusText}`)
        }

        const data = await response.json()
        return NextResponse.json(data)
    } catch (error) {
        console.error('Error storing asset:', error)
        return NextResponse.json(
            {error: 'Failed to store asset'},
            {status: 500},
        )
    }
}

export async function GET(
    request: NextRequest,
    {params}: { params: Promise<{ id: string }> },
) {
    try {
        const {id: rawId} = await params
        const id = sanitizeAssetId(rawId)
        const response = await fetch(`${BACKEND_URL}/uploads/${id}`)

        if (!response.ok) {
            return NextResponse.json(
                {error: 'Asset not found'},
                {status: 404},
            )
        }

        const data = await response.arrayBuffer()

        return new NextResponse(data, {
            headers: {
                'Content-Type': response.headers.get('Content-Type') || 'application/octet-stream',
            },
        })
    } catch (error) {
        console.error('Error loading asset:', error)
        return NextResponse.json(
            {error: 'Asset not found'},
            {status: 404},
        )
    }
}
