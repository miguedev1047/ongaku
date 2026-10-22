import { Component, type ErrorInfo, type ReactNode } from 'react'

type ReleaseErrorBoundaryProps = {
  fallback: ReactNode
  children: ReactNode
}

type ReleaseErrorBoundaryState = {
  hasError: boolean
}

export class ReleaseErrorBoundary extends Component<
  ReleaseErrorBoundaryProps,
  ReleaseErrorBoundaryState
> {
  state: ReleaseErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ReleaseErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    console.error('[ONGAKU]: Failed to load the latest release.', error, info)
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children
  }
}
