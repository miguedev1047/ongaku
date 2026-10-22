import { GithubIcon, Download04Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { buttonVariants } from "@ongaku/ui/components/ui/button"
import { cn } from "cn"

import { LATEST_RELEASE_URL, REPOSITORY_URL } from "@/features/landing/constants"
import { SiteLogo } from "@/features/landing/components/site-logo"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 px-4 lg:px-6">
        <a
          href="/"
          className="rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          aria-label="Ongaku home"
        >
          <SiteLogo />
        </a>

        <nav aria-label="Main" className="flex items-center gap-1.5">
          <a
            href={REPOSITORY_URL}
            target="_blank"
            rel="noreferrer"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
          >
            <HugeiconsIcon icon={GithubIcon} data-icon="inline-start" />
            GitHub
          </a>
          <a
            href={LATEST_RELEASE_URL}
            className={cn(buttonVariants({ variant: "default", size: "sm" }))}
          >
            <HugeiconsIcon icon={Download04Icon} data-icon="inline-start" />
            Download
          </a>
        </nav>
      </div>
    </header>
  )
}
