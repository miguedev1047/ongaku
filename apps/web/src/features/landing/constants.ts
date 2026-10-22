import appImg1 from "@ongaku/assets/screenshots/app-img-1.png"
import appImg2 from "@ongaku/assets/screenshots/app-img-2.png"
import appImg3 from "@ongaku/assets/screenshots/app-img-3.png"
import appImg4 from "@ongaku/assets/screenshots/app-img-4.png"

export const REPOSITORY_URL = "https://github.com/miguedev1047/ongaku"
export const RELEASES_URL = `${REPOSITORY_URL}/releases`
export const LATEST_RELEASE_URL = `${REPOSITORY_URL}/releases/latest`
export const LICENSE_URL = `${REPOSITORY_URL}/blob/master/LICENSE.md`
export const ISSUES_URL = `${REPOSITORY_URL}/issues`

export const SITE_NAME = "Ongaku"
export const SITE_TITLE = "Ongaku — Desktop music, without the noise"
export const SITE_DESCRIPTION =
  "A lightweight, minimal desktop music player and YouTube downloader for Windows, macOS and Linux."
export const SOCIAL_IMAGE_URL =
  "https://raw.githubusercontent.com/miguedev1047/ongaku/master/packages/assets/public/screenshots/app-img-2.png"

export const HERO_SCREENSHOT = {
  src: appImg2,
  alt: "Ongaku desktop app showing the playlists view with album artwork, folders and the playback bar",
}

export const SCREENSHOTS = [
  {
    src: appImg1,
    alt: "Ongaku YouTube search results with video thumbnails, durations and download actions",
    label: "Search",
    title: "Find it on YouTube",
    description:
      "Search, preview and queue tracks without leaving the player.",
  },
  {
    src: appImg2,
    alt: "Ongaku playlists view with music folders and track counts",
    label: "Library",
    title: "Your collection, organized",
    description:
      "Playlists, folders and a library that keeps local music tidy.",
  },
  {
    src: appImg3,
    alt: "Ongaku download page showing a YouTube URL, 1229 found tracks and batch download controls in a light theme",
    label: "Downloads",
    title: "Batch downloads",
    description:
      "Paste a song, album or playlist URL and pick exactly what to keep.",
  },
  {
    src: appImg4,
    alt: "Ongaku download page in a dark theme with the same batch download workflow",
    label: "Themes",
    title: "Light or dark",
    description:
      "Seven bundled themes that follow your desktop, not the other way around.",
  },
]
