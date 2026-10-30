import demoApp1 from '@ongaku/assets/screenshots/demo-app-1.webp'
import demoApp2 from '@ongaku/assets/screenshots/demo-app-2.webp'
import demoApp3 from '@ongaku/assets/screenshots/demo-app-3.webp'
import demoApp4 from '@ongaku/assets/screenshots/demo-app-4.webp'
import demoApp5 from '@ongaku/assets/screenshots/demo-app-5.webp'
import demoApp6 from '@ongaku/assets/screenshots/demo-app-6.webp'
import demoApp7 from '@ongaku/assets/screenshots/demo-app-7.webp'
import demoApp8 from '@ongaku/assets/screenshots/demo-app-8.webp'
import demoApp9 from '@ongaku/assets/screenshots/demo-app-9.webp'
import demoApp10 from '@ongaku/assets/screenshots/demo-app-10.webp'
import demoApp11 from '@ongaku/assets/screenshots/demo-app-11.webp'
import demoApp12 from '@ongaku/assets/screenshots/demo-app-12.webp'

import { buildMarqueeLayout } from '@/features/landing/lib/marquee-layout'

export const REPOSITORY_URL = 'https://github.com/miguedev1047/ongaku'
export const RELEASES_URL = `${REPOSITORY_URL}/releases`
export const LICENSE_URL = `${REPOSITORY_URL}/blob/master/LICENSE.md`
export const ISSUES_URL = `${REPOSITORY_URL}/issues`

export const SITE_NAME = 'Ongaku'
export const SOCIAL_IMAGE_URL =
  'https://raw.githubusercontent.com/miguedev1047/ongaku/master/packages/assets/public/screenshots/demo-app-2.webp'

export const SCREENSHOT_ASSETS = [
  demoApp1,
  demoApp2,
  demoApp3,
  demoApp4,
  demoApp5,
  demoApp6,
  demoApp7,
  demoApp8,
  demoApp9,
  demoApp10,
  demoApp11,
  demoApp12,
]

export const SCREENSHOTS = buildMarqueeLayout(SCREENSHOT_ASSETS, {
  columns: 4,
  rows: 12,
  seed: 0x5eed,
})
