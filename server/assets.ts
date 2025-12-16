import { mkdir, readFile, writeFile } from 'fs/promises'
import { join, resolve } from 'path'
import { Readable } from 'stream'

const DIR = resolve('./.assets')

function sanitizeAssetId( id: string ): string {
    return id.replace(/[^a-zA-Z0-9_.-]/g, '_')
}

export async function storeAsset( id: string, stream: Readable ) {
    const sanitized = sanitizeAssetId(id)
    await mkdir(DIR, {recursive: true})
    await writeFile(join(DIR, sanitized), stream)
}

export async function loadAsset( id: string ) {
    const sanitized = sanitizeAssetId(id)
    return await readFile(join(DIR, sanitized))
}
