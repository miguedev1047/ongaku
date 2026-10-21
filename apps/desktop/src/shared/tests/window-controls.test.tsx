import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import {
  WindowControls,
  WindowMinimizeButton,
  WindowMaximizeButton,
  WindowCloseButton,
} from '@/components/ui/window-controls'
import { RouteHeader } from '@/components/ui/route-header'
import { SidebarProvider } from '@/components/ui/sidebar'
import { platformService } from '@/infrastructure/platform'

describe('Window Controls', () => {
  it('renders all three window control buttons with accessible labels', () => {
    render(<WindowControls />)

    expect(screen.getByRole('button', { name: 'Minimize' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Maximize' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument()
  })

  it('calls minimizeWindow when minimize button is clicked', () => {
    const minimizeSpy = vi.spyOn(platformService, 'minimizeWindow').mockResolvedValue(undefined)
    render(<WindowMinimizeButton />)

    const btn = screen.getByRole('button', { name: 'Minimize' })
    fireEvent.click(btn)

    expect(minimizeSpy).toHaveBeenCalledTimes(1)
  })

  it('calls closeWindow when close button is clicked', () => {
    const closeSpy = vi.spyOn(platformService, 'closeWindow').mockResolvedValue(undefined)
    render(<WindowCloseButton />)

    const btn = screen.getByRole('button', { name: 'Close' })
    fireEvent.click(btn)

    expect(closeSpy).toHaveBeenCalledTimes(1)
  })

  it('toggles maximize state and updates aria-label and icon', async () => {
    let maximized = false
    vi.spyOn(platformService, 'isWindowMaximized').mockImplementation(async () => maximized)
    vi.spyOn(platformService, 'toggleMaximizeWindow').mockImplementation(async () => {
      maximized = !maximized
    })

    render(<WindowMaximizeButton />)

    const btn = screen.getByRole('button', { name: 'Maximize' })
    expect(btn).toBeInTheDocument()

    fireEvent.click(btn)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Restore' })).toBeInTheDocument()
    })
  })

  it('integrates window controls and drag region into RouteHeader', async () => {
    let containerElement: HTMLElement

    await act(async () => {
      const { container } = render(
        <SidebarProvider>
          <RouteHeader>
            <div>Test Page Header</div>
          </RouteHeader>
        </SidebarProvider>,
      )
      containerElement = container
    })

    const header = containerElement!.querySelector('header')
    expect(header).toHaveAttribute('data-tauri-drag-region')
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument()
  })
})
