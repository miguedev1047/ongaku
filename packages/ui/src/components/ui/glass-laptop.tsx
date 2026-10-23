'use client'

import '../../styles/ui/laptop.css'
import { clsx } from 'cn'
import { forwardRef, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { CSSProperties, HTMLAttributes } from 'react'

// The screen geometry; its default CSS width is half the pixel width.
const PANEL_WIDTH = 3456

const PANEL_HEIGHT = 2234

// The case in millimetres, as the stylesheet draws it: 355.7 wide and 248 deep, a 9.855 mm
// base under a 5.5 mm lid. Its corners are rounded to 6.2 mm in plan, measured from a
// photograph of the underside. The case's left edge and the deck sit at these points of the
// drawing.
const WIDTH = 355.7

const DEPTH = 248

const RADIUS = 6.2

const LEFT = 11.65

const DECK = 241.2

// The base and how far its bottom edge rolls under, which rounds its ends seen from in front.
const BASE = 9.855

const ROLL = 3.6

// Flat facets per rounded corner, and how far each overlaps the next so no seam opens.
const FACETS = 6

const OVERLAP = 0.15

// Key widths in keyboard units, from the function row at the hinge to the bottom row, whose
// arrow keys are drawn separately.
const KEY_ROWS = [
  [1.5, ...Array.from({ length: 12 }, () => 1), 1],
  [...Array.from({ length: 13 }, () => 1), 1.5],
  [1.5, ...Array.from({ length: 12 }, () => 1), 1],
  [1.75, ...Array.from({ length: 11 }, () => 1), 1.75],
  [2.25, ...Array.from({ length: 10 }, () => 1), 2.25],
  [1, 1, 1, 1.25, 5, 1.25, 1],
]

type FacetStyle = CSSProperties & Record<'--lg-laptop-turn', string>

const mm = (value: number) =>
  `calc(${Number(value.toFixed(4))} * var(--lg-laptop-u))`

const radians = (degrees: number) => (degrees * Math.PI) / 180

// How much darker a facet turned this far from facing you looks.
const turn = (degrees: number) =>
  `${Math.round((1 - Math.cos(radians(degrees))) * 45)}%`

// How tall the base looks at a turn of its corner, as its bottom edge rolls under, as a share
// of its full height.
const roll = (degrees: number) =>
  `${(((BASE - ROLL * (1 - Math.cos(radians(degrees)))) / BASE) * 100).toFixed(2)}%`

const chord = (from: number, to: number) =>
  2 * RADIUS * Math.sin(radians(Math.abs(to - from) / 2)) + OVERLAP

// A facet of the base's front corners, standing upright. Angles run in plan: 0 faces you, 90
// faces left and -90 faces right. It is drawn from its end at the larger angle.
const baseFacet = (centre: number, from: number, to: number): FacetStyle => {
  const start = radians(Math.max(from, to))
  const middle = (from + to) / 2

  return {
    '--lg-laptop-turn': turn(middle),
    clipPath: `polygon(0 0, 100% 0, 100% ${roll(Math.min(from, to))}, 0 ${roll(Math.max(from, to))})`,
    transform: `translate3d(${mm(centre - RADIUS * Math.sin(start))}, ${mm(DECK)}, ${mm(DEPTH - RADIUS + RADIUS * Math.cos(start))}) rotateY(${-middle}deg)`,
    width: mm(chord(from, to)),
  }
}

// A facet of the lid's top corners, in the plane of the screen, standing back into the lid.
// Angles run in that plane: -90 faces up, -180 faces left and 0 faces right.
const lidFacet = (centre: number, from: number, to: number): FacetStyle => {
  const start = radians(Math.max(from, to))
  const middle = (from + to) / 2

  return {
    '--lg-laptop-turn': turn(middle + 90),
    transform: `translate(${mm(centre + RADIUS * Math.cos(start))}, ${mm(RADIUS + RADIUS * Math.sin(start))}) rotateZ(${middle - 90}deg) rotateX(-90deg)`,
    width: mm(chord(from, to)),
  }
}

const sweep = (
  facet: (centre: number, from: number, to: number) => FacetStyle,
  centre: number,
  from: number,
  by: number,
) =>
  Array.from({ length: FACETS }, (_, index) =>
    facet(
      centre,
      from + (by * index) / FACETS,
      from + (by * (index + 1)) / FACETS,
    ),
  )

const BASE_FACETS = [
  ...sweep(baseFacet, LEFT + RADIUS, 0, 90),
  ...sweep(baseFacet, LEFT + WIDTH - RADIUS, 0, -90),
]

const LID_FACETS = [
  ...sweep(lidFacet, RADIUS, -90, -90),
  ...sweep(lidFacet, WIDTH - RADIUS, -90, 90),
]

// The longest transition an element is styled with, delay included, in milliseconds. It is
// 0 when motion is reduced.
const transitionTime = (element: Element) => {
  const style = getComputedStyle(element)
  const delays = style.transitionDelay.split(',')

  return Math.max(
    ...style.transitionDuration
      .split(',')
      .map(
        (duration, index) =>
          (parseFloat(duration) + parseFloat(delays[index % delays.length])) *
          1000,
      ),
  )
}

/** The keyboard, drawn on the deck: six rows of keys and the inverted-T arrows. */
function Keyboard() {
  return (
    <span className='lg-laptop-keyboard'>
      {KEY_ROWS.map((row, rowIndex) => (
        <span key={rowIndex} className='lg-laptop-key-row'>
          {row.map((units, index) => (
            <span
              key={index}
              className='lg-laptop-key'
              style={{ flexGrow: units }}
            />
          ))}
          {rowIndex === KEY_ROWS.length - 1 ? (
            <span className='lg-laptop-arrows'>
              <span className='lg-laptop-key lg-laptop-key--half' />
              <span className='lg-laptop-arrow-stack'>
                <span className='lg-laptop-key' />
                <span className='lg-laptop-key' />
              </span>
              <span className='lg-laptop-key lg-laptop-key--half' />
            </span>
          ) : null}
        </span>
      ))}
    </span>
  )
}

export type GlassLaptopFinish = 'black' | 'silver'

export type GlassLaptopProps = HTMLAttributes<HTMLElement> & {
  /** The case colour. */
  finish?: GlassLaptopFinish
  /** A faint reflection across the glass. Turn it off for flat screenshots. */
  glare?: boolean
  /** Whether the lid is up. Changing it opens or closes the lid. */
  open?: boolean
  /**
   * The width in CSS pixels the screen lays its content out at before scaling it to fit.
   * Defaults to 1728, half the screen geometry's pixel width.
   */
  resolution?: number
}

/**
 * A laptop mockup drawn in CSS 3D with no images or WebGL. Open, it faces you; shut, the
 * view rises to show the closed case from above, and moves back down as the lid opens.
 * Children fill the screen at the chosen resolution and the notch sits over them.
 * Anything the children portal out, such as a menu or dialog,
 * opens on the page unscaled.
 *
 * The screen lights only once the lid is up and the view has settled, and goes dark
 * before the lid closes. The children render only while it is lit, so they are never laid
 * out on a moving or tilted screen. Reduced motion opens and closes it at once.
 */
export const GlassLaptop = forwardRef<HTMLElement, GlassLaptopProps>(
  (
    {
      children,
      className,
      finish = 'black',
      glare = true,
      open = true,
      resolution = 1728,
      ...rest
    },
    forwardedRef,
  ) => {
    const [lit, setLit] = useState(open)
    const rigRef = useRef<HTMLDivElement>(null)
    const lidRef = useRef<HTMLDivElement>(null)
    const screenRef = useRef<HTMLDivElement>(null)
    const displayRef = useRef<HTMLDivElement>(null)
    const shutterRef = useRef<HTMLSpanElement>(null)

    // Lights the screen once the lid and the view have come to rest, and turns it off once it
    // has faded to black, before the lid starts to close.
    useEffect(() => {
      const moving = open
        ? [lidRef.current, rigRef.current]
        : [shutterRef.current]
      const elements = moving.filter((element) => element !== null)

      if (elements.length === 0) return

      const timer = window.setTimeout(
        () => setLit(open),
        Math.max(...elements.map(transitionTime)),
      )

      return () => window.clearTimeout(timer)
    }, [open])

    // Scales the content to the screen before the first paint and on every resize. The
    // computed width keeps the fraction of a pixel that clientWidth rounds away.
    useLayoutEffect(() => {
      const screen = screenRef.current
      const display = displayRef.current

      if (!screen || !display) return

      const fit = () => {
        const width = parseFloat(getComputedStyle(screen).width)

        display.style.setProperty(
          '--lg-laptop-scale',
          String(width / resolution),
        )
        display.dataset.fitted = ''
      }

      fit()

      const observer = new ResizeObserver(fit)

      observer.observe(screen)

      return () => observer.disconnect()
    }, [resolution])

    return (
      <figure
        ref={forwardedRef}
        className={clsx('lg-laptop', className)}
        data-finish={finish}
        data-lid={open ? 'open' : 'closed'}
        data-screen={open && lit ? 'on' : 'off'}
        {...rest}
      >
        <div className='lg-laptop-body'>
          <span aria-hidden className='lg-laptop-shadow' />
          <div ref={rigRef} className='lg-laptop-rig'>
            <span aria-hidden className='lg-laptop-ground' />
            <span aria-hidden className='lg-laptop-deck'>
              <span className='lg-laptop-speaker' data-side='left' />
              <span className='lg-laptop-speaker' data-side='right' />
              <Keyboard />
              <span className='lg-laptop-trackpad' />
              <span className='lg-laptop-deck-scoop' />
            </span>
            <span aria-hidden className='lg-laptop-front'>
              <span className='lg-laptop-scoop' />
            </span>
            {BASE_FACETS.map((style, index) => (
              <span
                key={index}
                aria-hidden
                className='lg-laptop-base-facet'
                style={style}
              />
            ))}
            <div ref={lidRef} className='lg-laptop-lid'>
              <span aria-hidden className='lg-laptop-hinge' />
              <span aria-hidden className='lg-laptop-lid-back' />
              <span aria-hidden className='lg-laptop-lid-edge' />
              {LID_FACETS.map((style, index) => (
                <span
                  key={index}
                  aria-hidden
                  className='lg-laptop-lid-facet'
                  style={style}
                />
              ))}
              <div className='lg-laptop-lid-face'>
                <div className='lg-laptop-glass'>
                  <div ref={screenRef} className='lg-laptop-screen'>
                    <div
                      ref={displayRef}
                      className='lg-laptop-display'
                      style={{
                        height: Math.round(
                          (resolution * PANEL_HEIGHT) / PANEL_WIDTH,
                        ),
                        width: resolution,
                      }}
                    >
                      {lit ? children : null}
                    </div>
                    <span
                      ref={shutterRef}
                      aria-hidden
                      className='lg-laptop-shutter'
                    />
                  </div>
                  <span aria-hidden className='lg-laptop-notch'>
                    <span className='lg-laptop-camera' />
                  </span>
                  {glare ? (
                    <span aria-hidden className='lg-laptop-glare' />
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </figure>
    )
  },
)

GlassLaptop.displayName = 'GlassLaptop'
