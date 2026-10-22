import {
  Bug01Icon,
  GithubIcon,
  LicenseIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { buttonVariants } from "@ongaku/ui/components/ui/button"
import { Separator } from "@ongaku/ui/components/ui/separator"
import { ModeToggle } from "@ongaku/ui/providers/theme-provider"
import { cn } from "cn"
import { useTranslation } from "react-i18next"

import {
  ISSUES_URL,
  LICENSE_URL,
  REPOSITORY_URL,
} from "@/features/landing/constants"
import { SiteLogo } from "@/features/landing/components/site-logo"

const FOOTER_LINKS = [
  { key: "github", href: REPOSITORY_URL, icon: GithubIcon },
  { key: "issues", href: ISSUES_URL, icon: Bug01Icon },
  { key: "license", href: LICENSE_URL, icon: LicenseIcon },
] as const

export function SiteFooter() {
  const { t } = useTranslation(["footer", "navigation"])

  return (
    <footer className="border-t border-border/60 bg-card/30">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 lg:px-6">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <SiteLogo />
            <Separator orientation="vertical" />
            <p className="text-2xs text-muted-foreground">{t("tagline")}</p>
          </div>

          <nav
            aria-label={t("navigation:footer")}
            className="flex flex-wrap items-center gap-1"
          >
            {FOOTER_LINKS.map((link) => (
              <a
                key={link.key}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className={cn(
                  buttonVariants({ variant: "ghost-muted", size: "sm" }),
                )}
              >
                <HugeiconsIcon icon={link.icon} data-icon="inline-start" />
                {t(link.key)}
              </a>
            ))}
            <ModeToggle label={t("navigation:theme")} />
          </nav>
        </div>

        <div className="flex flex-col justify-between gap-2 text-2xs text-muted-foreground sm:flex-row">
          <p>{t("copyright", { year: 2026 })}</p>
          <p>{t("disclaimer")}</p>
        </div>
      </div>
    </footer>
  )
}
