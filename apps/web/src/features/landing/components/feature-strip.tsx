import {
  ComputerIcon,
  Download04Icon,
  MusicNote01Icon,
  YoutubeIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

const FEATURES = [
  {
    icon: MusicNote01Icon,
    title: "Local library",
    description:
      "Scan folders, read tags and play your own files with a native audio engine.",
  },
  {
    icon: YoutubeIcon,
    title: "YouTube search",
    description:
      "Find tracks, preview results and add them to your library without a browser tab.",
  },
  {
    icon: Download04Icon,
    title: "Batch downloads",
    description:
      "Paste a song, album or playlist URL, review the tracks and download only what you want.",
  },
  {
    icon: ComputerIcon,
    title: "Native desktop",
    description:
      "Built with Tauri for Windows, macOS and Linux. Small binary, real desktop behavior.",
  },
]

export function FeatureStrip() {
  return (
    <section className="border-y border-border/60 bg-card/40">
      <div className="mx-auto grid w-full max-w-6xl divide-y divide-border/60 px-4 sm:grid-cols-2 sm:divide-x lg:grid-cols-4 lg:divide-y-0 lg:px-6">
        {FEATURES.map((feature) => (
          <div
            key={feature.title}
            className="flex flex-col gap-3 py-8 sm:px-6 sm:first:pl-0 sm:last:pr-0 lg:py-10"
          >
            <span className="flex size-9 items-center justify-center rounded-md border border-border/60 bg-background text-foreground">
              <HugeiconsIcon icon={feature.icon} />
            </span>
            <h2 className="font-heading text-sm font-medium">
              {feature.title}
            </h2>
            <p className="text-xs leading-relaxed text-muted-foreground">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
