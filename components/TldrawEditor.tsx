'use client'

import { useEffect, useState } from 'react'
import { Tldraw, AssetRecordType, getHashForString, TLAssetStore, TLBookmarkAsset, uniqueId } from 'tldraw'
import { useSync } from '@tldraw/sync'
import 'tldraw/tldraw.css'

function generateUUID(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID()
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function ( c ) {
        const r = Math.random() * 16 | 0
        const v = c === 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
    })
}

export default function TldrawEditor() {
    const [roomId, setRoomId] = useState<string>('')

    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        let room = params.get('room')

        if (!room) {
            room = generateUUID()
            const newUrl = `${window.location.pathname}?room=${room}`
            window.history.replaceState({}, '', newUrl)
        }

        setRoomId(room)
    }, [])

    useEffect(() => {
        if (!roomId) return
        const removeWatermark = () => {
            const elementToRemove = document.querySelector('.tl-watermark_SEE-LICENSE')
            if (elementToRemove) {
                elementToRemove.remove()
            }
        }
        removeWatermark()
        const observer = new MutationObserver(() => {
            removeWatermark()
        })
        observer.observe(document.body, {
            childList: true,
            subtree: true,
        })
        return () => {
            observer.disconnect()
        }
    }, [roomId])


    // Use custom sync server if specified, otherwise fall back to demo sync
    const SYNC_SERVER_URL = process.env.NEXT_PUBLIC_SYNC_SERVER_URL?.trim()
    const USE_DEMO_SYNC = !SYNC_SERVER_URL

    const store = useSync({
        uri: USE_DEMO_SYNC 
            ? `https://demo.tldraw.xyz/connect/${roomId}`
            : `${SYNC_SERVER_URL}/connect/${roomId}`,
        assets: multiplayerAssets,
    })

    if (!roomId) {
        return (
            <div className="flex items-center justify-center w-screen h-screen bg-gray-50">
                <div className="text-gray-600">Loading...</div>
            </div>
        )
    }

    return (
        <div style={{position: 'fixed', inset: 0}}>
            <Tldraw
                store={store}
                deepLinks
                onMount={(editor) => {
                    // when the editor is ready, we need to register our bookmark unfurling service
                    editor.registerExternalAssetHandler('url', unfurlBookmarkUrl)
                }}
            />
        </div>
    )
}

// How does our server handle assets like images and videos?
const multiplayerAssets: TLAssetStore = {
    // to upload an asset, we prefix it with a unique id, upload to Vercel Blob, and return the URL
    async upload(_asset, file) {
        // Use Next.js API route for assets (uploads to Vercel Blob)
        const id = uniqueId()
        const objectName = `${id}-${file.name}`
        const url = `/api/uploads/${encodeURIComponent(objectName)}`

        const response = await fetch(url, {
            method: 'PUT',
            body: file,
        })

        if (!response.ok) {
            throw new Error(`Failed to upload asset: ${response.statusText}`)
        }

        // Get the blob URL from the response
        const data = await response.json()
        return { src: data.url || url }
    },
    // to retrieve an asset, we can just use the same URL. you could customize this to add extra
    // auth, or to serve optimized versions / sizes of the asset.
    resolve(asset) {
        return asset.props.src
    },
}

// How does our server handle bookmark unfurling?
async function unfurlBookmarkUrl({ url }: { url: string }): Promise<TLBookmarkAsset> {
    // Use Next.js API route for unfurling (works on Vercel)
    const asset: TLBookmarkAsset = {
        id: AssetRecordType.createId(getHashForString(url)),
        typeName: 'asset',
        type: 'bookmark',
        meta: {},
        props: {
            src: url,
            description: '',
            image: '',
            favicon: '',
            title: '',
        },
    }

    try {
        const response = await fetch(`/api/unfurl?url=${encodeURIComponent(url)}`)
        const data = await response.json()

        asset.props.description = data?.description ?? ''
        asset.props.image = data?.image ?? ''
        asset.props.favicon = data?.favicon ?? ''
        asset.props.title = data?.title ?? ''
    } catch (e) {
        console.error(e)
    }

    return asset
}
