import { describe, expect, it } from 'vitest'

import { getRouter } from '@/router'

describe('router query isolation', () => {
  it('creates a separate query client for every router', () => {
    const first = getRouter()
    const second = getRouter()

    expect(first.options.context.queryClient).not.toBe(
      second.options.context.queryClient,
    )
    expect(first.options.context.queryClient.getQueryCache()).not.toBe(
      second.options.context.queryClient.getQueryCache(),
    )
  })
})
