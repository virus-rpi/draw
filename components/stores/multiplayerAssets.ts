import { TLAssetStore, uniqueId } from 'tldraw'

export const multiplayerAssets: TLAssetStore = {
    async upload( _asset, file ) {
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

        const data = await response.json()
        return {src: data.url || url}
    },
    resolve( asset ) {
        return asset.props.src
    },
}
