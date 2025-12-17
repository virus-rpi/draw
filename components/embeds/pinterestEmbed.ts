import { CustomEmbedDefinition } from 'tldraw'

export const customPinterestEmbed: CustomEmbedDefinition = {
    type: 'pinterest',
    title: 'Pinterest',
    hostnames: ['pinterest.com', 'www.pinterest.com', 'pin.it', 'pinimg.com', 'i.pinimg.com'],
    minWidth: 300,
    minHeight: 400,
    width: 345,
    height: 445,
    doesResize: false,
    toEmbedUrl: ( url ) => {
        const urlObj = new URL(url)

        if (urlObj.hostname === 'pin.it') {
            setTimeout(() => {
                const event = new CustomEvent('show-toast', {
                    detail: {
                        title: 'Pinterest shortcode detected! Please visit the pin.it link in your browser, then copy and paste the full pinterest.com URL instead.',
                        severity: 'info',
                    },
                })
                window.dispatchEvent(event)
            }, 100)
            return undefined
        }

        if (urlObj.hostname === 'pinimg.com' || urlObj.hostname === 'i.pinimg.com') {
            return url
        }

        const matches = urlObj.pathname.match(/\/pin\/(\d+)/)
        if (matches) {
            return `https://assets.pinterest.com/ext/embed.html?id=${matches[1]}`
        }

        return
    },
    fromEmbedUrl: ( url ) => {
        const urlObj = new URL(url)

        if (urlObj.hostname === 'pinimg.com' || urlObj.hostname === 'i.pinimg.com') {
            return url
        }

        const params = new URLSearchParams(urlObj.search)
        const pinId = params.get('id')
        if (pinId) {
            return `https://www.pinterest.com/pin/${pinId}/`
        }

        return url
    },
    icon: 'https://s.pinimg.com/webapp/favicon_48x48-7470a30d.png',
}
