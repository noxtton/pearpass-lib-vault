import { faviconBuffers } from '../favicons/favicons'

export const getDefaultFavicon = (domain) => faviconBuffers[domain] || null
