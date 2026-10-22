import {
  ArrowUpRight01Icon,
  Download04Icon,
  GithubIcon,
  MusicNote01Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Badge } from "@ongaku/ui/components/ui/badge"
import { Button, buttonVariants } from "@ongaku/ui/components/ui/button"
import { cn } from "cn"

import {
  HERO_SCREENSHOT,
  LATEST_RELEASE_URL,
  REPOSITORY_URL,
} from "@/features/landing/constants"

const PLATFORMS = ["Windows", "macOS", "Linux"]

const EQUALIZER_BARS = [
  "h-2",
  "h-3",
  "h-4",
  "h-2.5",
  "h-3.5",
  "h-1.5",
  "h-3",
]

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="landing-grid pointer-events-none absolute inset-0" />
      <div className="landing-hero-glow pointer-events-none absolute inset-0" />

      <div className="relative mx-auto grid w-full max-w-6xl gap-12 px-4 pt-16 pb-20 lg:grid-cols-12 lg:gap-8 lg:px-6 lg:pt-24 lg:pb-28">
        <div className="flex flex-col items-start justify-center lg:col-span-7">
          <Badge variant="outline" size="sm">
            <HugeiconsIcon icon={MusicNote01Icon} />
            Open source desktop player
          </Badge>

          <h1 className="landing-display mt-6 font-heading text-4xl font-semibold leading-none sm:text-5xl lg:text-6xl">
            Desktop music,
            <br />
            <span className="text-muted-foreground">without the noise.</span>
          </h1>

          <p className="mt-6 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
            Ongaku plays your local library, searches YouTube and downloads
            tracks in one small native app. No account, no feed, no noise.
          </p>

          <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              size="lg"
              className="w-full sm:w-auto"
              render={<a href={LATEST_RELEASE_URL} />}
            >
              <HugeiconsIcon icon={Download04Icon} data-icon="inline-start" />
              Download the latest release
              <HugeiconsIcon icon={ArrowUpRight01Icon} data-icon="inline-end" />
            </Button>
            <a
              href={REPOSITORY_URL}
              target="_blank"
              rel="noreferrer"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "w-full sm:w-auto",
              )}
            >
              <HugeiconsIcon icon={GithubIcon} data-icon="inline-start" />
              View source
            </a>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 text-2xs text-muted-foreground">
            <span className="font-medium tracking-wider uppercase">
              Free · MIT licensed
            </span>
            <span aria-hidden="true" className="h-1 w-1 rounded-sm bg-border" />
            {PLATFORMS.map((platform) => (
              <span key={platform}>{platform}</span>
            ))}
          </div>
        </div>

        <div className="relative lg:col-span-5">
          <div className="relative overflow-hidden rounded-lg border border-border/70 bg-card shadow-2xl">
            <div className="flex items-center gap-1.5 border-b border-border/60 px-4 py-3">
              <span
                aria-hidden="true"
                className="size-2 rounded-sm bg-destructive/70"
              />
              <span
                aria-hidden="true"
                className="size-2 rounded-sm bg-warning/70"
              />
              <span
                aria-hidden="true"
                className="size-2 rounded-sm bg-success/70"
              />
              <span className="ml-3 text-2xs tracking-wider text-muted-foreground uppercase">
                Ongaku
              </span>
            </div>
            <img
              src={HERO_SCREENSHOT.src}
              alt={HERO_SCREENSHOT.alt}
              className="w-full"
              fetchPriority="high"
              decoding="async"
            />
          </div>

          <div className="absolute -bottom-6 -left-3 hidden w-60 rounded-md border border-border/60 bg-card/95 p-3 shadow-xl backdrop-blur-md sm:block">
            <div className="flex items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-sm bg-primary text-primary-foreground">
                <HugeiconsIcon icon={MusicNote01Icon} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-medium">
                  Local playback
                </span>
                <span className="block truncate text-2xs text-muted-foreground">
                  Native audio engine
                </span>
              </span>
              <span className="flex items-end gap-0.5" aria-hidden="true">
                {EQUALIZER_BARS.map((height, index) => (
                  <span
                    key={index}
                    className={cn("w-0.5 bg-primary/70", height)}
                  />
                ))}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
