import { NextRequest, NextResponse } from 'next/server'
import _unfurl from 'unfurl.js'

export async function GET(request: NextRequest) {
    try {
        const url = request.nextUrl.searchParams.get('url')
        
        if (!url) {
            return NextResponse.json(
                { error: 'URL parameter is required' },
                { status: 400 }
            )
        }

        const { title, description, open_graph, twitter_card, favicon } = await _unfurl.unfurl(url)

        const image = open_graph?.images?.[0]?.url || twitter_card?.images?.[0]?.url

        return NextResponse.json({
            title,
            description,
            image,
            favicon,
        })
    } catch (error) {
        console.error('Error unfurling URL:', error)
        return NextResponse.json(
            {
                title: '',
                description: '',
                image: '',
                favicon: '',
            },
            { status: 200 }
        )
    }
}
