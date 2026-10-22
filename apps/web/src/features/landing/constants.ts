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
  key: "library",
  src: appImg2,
} as const

export const SCREENSHOTS = [
  { key: "search", src: appImg1 },
  { key: "library", src: appImg2 },
  { key: "downloads", src: appImg3 },
  { key: "themes", src: appImg4 },
] as const
