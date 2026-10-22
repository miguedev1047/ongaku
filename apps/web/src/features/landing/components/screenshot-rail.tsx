import { Badge } from "@ongaku/ui/components/ui/badge"
import { useTranslation } from "react-i18next"

import { SCREENSHOTS } from "@/features/landing/constants"

export function ScreenshotRail() {
  const { t } = useTranslation(["landing", "common"])

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-20 lg:px-6 lg:py-28">
      <div className="max-w-2xl">
        <p className="text-2xs font-medium tracking-widest text-muted-foreground uppercase">
          {t("screenshots.eyebrow")}
        </p>
        <h2 className="landing-display mt-3 font-heading text-2xl font-semibold sm:text-3xl">
          {t("screenshots.title")}
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          {t("screenshots.description")}
        </p>
      </div>

      <div
        role="region"
        aria-label={t("common:screenshotRegion")}
        tabIndex={0}
        className="no-scrollbar -mx-4 mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 outline-none focus-visible:ring-2 focus-visible:ring-ring/50 md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0 md:pb-0"
      >
        {SCREENSHOTS.map((screenshot) => (
          <figure
            key={screenshot.key}
            className="group w-80 shrink-0 snap-start overflow-hidden rounded-lg border border-border/60 bg-card md:w-auto"
          >
            <div className="overflow-hidden border-b border-border/60">
              <img
                src={screenshot.src}
                alt={t(`screenshots.items.${screenshot.key}.alt`)}
                loading="lazy"
                decoding="async"
                className="w-full transition-transform duration-500 group-hover:scale-105 motion-reduce:transform-none"
              />
            </div>
            <figcaption className="flex flex-col gap-2 p-5">
              <Badge variant="outline" size="sm" className="w-fit">
                {t(`screenshots.items.${screenshot.key}.label`)}
              </Badge>
              <span className="font-heading text-sm font-medium">
                {t(`screenshots.items.${screenshot.key}.title`)}
              </span>
              <span className="text-xs leading-relaxed text-muted-foreground">
                {t(`screenshots.items.${screenshot.key}.description`)}
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}
