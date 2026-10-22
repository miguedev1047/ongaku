import {
  ComputerIcon,
  Download04Icon,
  MusicNote01Icon,
  YoutubeIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useTranslation } from "react-i18next"

const FEATURES = [
  { key: "library", icon: MusicNote01Icon },
  { key: "youtube", icon: YoutubeIcon },
  { key: "downloads", icon: Download04Icon },
  { key: "native", icon: ComputerIcon },
] as const

export function FeatureStrip() {
  const { t } = useTranslation("landing")

  return (
    <section className="border-y border-border/60 bg-card/40">
      <div className="mx-auto grid w-full max-w-6xl divide-y divide-border/60 px-4 sm:grid-cols-2 sm:divide-x lg:grid-cols-4 lg:divide-y-0 lg:px-6">
        {FEATURES.map((feature) => (
          <div
            key={feature.key}
            className="flex flex-col gap-3 py-8 sm:px-6 sm:first:pl-0 sm:last:pr-0 lg:py-10"
          >
            <span className="flex size-9 items-center justify-center rounded-md border border-border/60 bg-background text-foreground">
              <HugeiconsIcon icon={feature.icon} />
            </span>
            <h2 className="font-heading text-sm font-medium">
              {t(`features.${feature.key}.title`)}
            </h2>
            <p className="text-xs leading-relaxed text-muted-foreground">
              {t(`features.${feature.key}.description`)}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
