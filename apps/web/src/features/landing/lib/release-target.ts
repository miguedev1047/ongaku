import { createIsomorphicFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'

import {
  detectReleaseTarget,
  type ReleaseTarget,
} from '@/features/landing/lib/release-assets'

export const getReleaseTarget = createIsomorphicFn()
  .server((): ReleaseTarget =>
    detectReleaseTarget(getRequestHeaders().get('user-agent')),
  )
  .client((): ReleaseTarget => detectReleaseTarget(navigator.userAgent))
