import appImg1 from '@ongaku/assets/screenshots/app-img-1.png'
import appImg2 from '@ongaku/assets/screenshots/app-img-2.png'
import appImg3 from '@ongaku/assets/screenshots/app-img-3.png'
import appImg4 from '@ongaku/assets/screenshots/app-img-4.png'
import appImg5 from '@ongaku/assets/screenshots/app-img-5.png'
import appImg6 from '@ongaku/assets/screenshots/app-img-6.png'
import appImg7 from '@ongaku/assets/screenshots/app-img-7.png'
import appImg8 from '@ongaku/assets/screenshots/app-img-8.png'
import appImg9 from '@ongaku/assets/screenshots/app-img-9.png'
import appImg10 from '@ongaku/assets/screenshots/app-img-10.png'
import appImg11 from '@ongaku/assets/screenshots/app-img-11.png'
import appImg12 from '@ongaku/assets/screenshots/app-img-12.png'

import { buildMarqueeLayout } from '@/features/landing/lib/marquee-layout'

export const REPOSITORY_URL = 'https://github.com/miguedev1047/ongaku'
export const RELEASES_URL = `${REPOSITORY_URL}/releases`
export const LICENSE_URL = `${REPOSITORY_URL}/blob/master/LICENSE.md`
export const ISSUES_URL = `${REPOSITORY_URL}/issues`

export const SITE_NAME = 'Ongaku'
export const SOCIAL_IMAGE_URL =
  'https://raw.githubusercontent.com/miguedev1047/ongaku/master/packages/assets/public/screenshots/app-img-2.png'

const SCREENSHOT_ASSETS = [
  appImg1,
  appImg2,
  appImg3,
  appImg4,
  appImg5,
  appImg6,
  appImg7,
  appImg8,
  appImg9,
  appImg10,
  appImg11,
  appImg12,
] as const

export const SCREENSHOTS = buildMarqueeLayout(SCREENSHOT_ASSETS, {
  columns: 4,
  rows: 12,
  seed: 0x5eed,
})
