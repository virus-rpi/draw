export function getSyncUrl( roomId: string ): string {
    if (process.env.NEXT_PUBLIC_SYNC_SERVER_URL) {
        return `${process.env.NEXT_PUBLIC_SYNC_SERVER_URL}/connect/${roomId}`
    }
    return `ws://localhost:5858/connect/${roomId}`
}
