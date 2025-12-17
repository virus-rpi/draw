import { DEFAULT_EMBED_DEFINITIONS, DefaultEmbedDefinitionType } from 'tldraw'
import { customPinterestEmbed } from '../embeds/pinterestEmbed'

export function getEmbedConfigs() {
    const defaultEmbedTypesToKeep: DefaultEmbedDefinitionType[] = ['spotify', 'youtube']
    const defaultEmbedsToKeep = DEFAULT_EMBED_DEFINITIONS.filter(( embed ) =>
        defaultEmbedTypesToKeep.includes(embed.type),
    )
    return [...defaultEmbedsToKeep, customPinterestEmbed]
}
