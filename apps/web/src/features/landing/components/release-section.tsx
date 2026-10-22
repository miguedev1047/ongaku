import { ArrowUpRight01Icon, Download04Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Badge } from "@ongaku/ui/components/ui/badge"
import { Button, buttonVariants } from "@ongaku/ui/components/ui/button"
import { Card } from "@ongaku/ui/components/ui/card"
import { cn } from "cn"
import { useTranslation } from "react-i18next"

import { LATEST_RELEASE_URL, RELEASES_URL } from "@/features/landing/constants"

const PLATFORM_RELEASES = [
  { key: "windows", format: ".exe" },
  { key: "macos", format: ".dmg" },
  { key: "linux", format: ".AppImage" },
] as const

export function ReleaseSection() {
  const { t } = useTranslation("downloads")

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
                {t("badge")}
              </Badge>
              <span className="text-2xs tracking-wider text-muted-foreground uppercase">
                {t("openSource")}
              </span>
            </div>

            <h2 className="landing-display mt-4 font-heading text-3xl font-semibold sm:text-4xl">
              {t("title")}
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
              {t("description")}
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                size="lg"
                className="w-full sm:w-auto"
                render={<a href={LATEST_RELEASE_URL} />}
                nativeButton={false}
              >
                <HugeiconsIcon icon={Download04Icon} data-icon="inline-start" />
                {t("cta")}
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
                {t("allReleases")}
              </a>
            </div>

            <p className="mt-4 text-2xs text-muted-foreground">{t("note")}</p>
          </div>

          <div className="divide-y divide-border/60 rounded-md border border-border/60 bg-background/40">
            {PLATFORM_RELEASES.map((release) => (
              <div
                key={release.key}
                className="flex items-center justify-between gap-4 px-5 py-4"
              >
                <div>
                  <p className="font-heading text-sm font-medium">
                    {t(`platforms.${release.key}.name`)}
                  </p>
                  <p className="text-2xs text-muted-foreground">
                    {t(`platforms.${release.key}.hint`)}
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
