export interface RecommendedWallpaperSource {
  id: string
  name: string
  url: string
  description: string
  badgeText: string
}

export const RECOMMENDED_WALLPAPER_SOURCES: RecommendedWallpaperSource[] = [
  {
    id: 'wallhaven',
    name: 'Wallhaven',
    url: 'https://wallhaven.cc',
    description: 'Anime, nature, abstract & 4K wallpapers',
    badgeText: 'wallhaven.cc',
  },
  {
    id: 'unsplash',
    name: 'Unsplash',
    url: 'https://unsplash.com/wallpapers',
    description: 'High-res photography & curated collections',
    badgeText: 'unsplash.com',
  },
  {
    id: 'pexels',
    name: 'Pexels',
    url: 'https://www.pexels.com/search/wallpaper',
    description: 'Free high-res stock photos & wallpapers',
    badgeText: 'pexels.com',
  },
  {
    id: 'pixabay',
    name: 'Pixabay',
    url: 'https://pixabay.com/images/search/wallpaper',
    description: 'Royalty-free photos & digital backgrounds',
    badgeText: 'pixabay.com',
  },
]
