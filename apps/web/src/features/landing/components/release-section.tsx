import { ArrowUpRight01Icon, Download04Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Badge } from "@ongaku/ui/components/ui/badge"
import { Button, buttonVariants } from "@ongaku/ui/components/ui/button"
import { Card } from "@ongaku/ui/components/ui/card"
import { cn } from "cn"

import {
  LATEST_RELEASE_URL,
  RELEASES_URL,
} from "@/features/landing/constants"

const PLATFORM_RELEASES = [
  {
    platform: "Windows",
    format: ".exe",
    hint: "NSIS installer",
  },
  {
    platform: "macOS",
    format: ".dmg",
    hint: "Apple silicon and Intel",
  },
  {
    platform: "Linux",
    format: ".AppImage",
    hint: "AppImage or Debian package",
  },
]

export function ReleaseSection() {
  return (
    <section
      id="download"
      className="mx-auto w-full max-w-6xl px-4 pb-20 lg:px-6 lg:pb-28"
    >
      <Card variant="default" className="w-full gap-8 p-6 sm:p-10">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" size="sm">
                <span
                  aria-hidden="true"
                  className="size-1.5 rounded-sm bg-success"
                />
                Latest release
              </Badge>
              <span className="text-2xs tracking-wider text-muted-foreground uppercase">
                Free · Open source
              </span>
            </div>

            <h2 className="landing-display mt-4 font-heading text-3xl font-semibold sm:text-4xl">
              Get Ongaku on your desktop.
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
              Installers are published with every release on GitHub. Pick your
              platform, download the latest build and keep your library local.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                size="lg"
                className="w-full sm:w-auto"
                render={<a href={LATEST_RELEASE_URL} />}
              >
                <HugeiconsIcon icon={Download04Icon} data-icon="inline-start" />
                Download latest
                <HugeiconsIcon
                  icon={ArrowUpRight01Icon}
                  data-icon="inline-end"
                />
              </Button>
              <a
                href={RELEASES_URL}
                target="_blank"
                rel="noreferrer"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "lg" }),
                  "w-full sm:w-auto",
                )}
              >
                All releases
              </a>
            </div>

            <p className="mt-4 text-2xs text-muted-foreground">
              The button always points to the newest GitHub release.
            </p>
          </div>

          <div className="divide-y divide-border/60 rounded-md border border-border/60 bg-background/40">
            {PLATFORM_RELEASES.map((release) => (
              <div
                key={release.platform}
                className="flex items-center justify-between gap-4 px-5 py-4"
              >
                <div>
                  <p className="font-heading text-sm font-medium">
                    {release.platform}
                  </p>
                  <p className="text-2xs text-muted-foreground">
                    {release.hint}
                  </p>
                </div>
                <code className="rounded-sm border border-border/60 bg-muted px-1.5 py-0.5 font-sans text-2xs font-medium text-foreground">
                  {release.format}
                </code>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </section>
  )
}
