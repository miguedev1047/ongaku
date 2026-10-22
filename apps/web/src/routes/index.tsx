import { createFileRoute } from "@tanstack/react-router"

import { FeatureStrip } from "@/features/landing/components/feature-strip"
import { Hero } from "@/features/landing/components/hero"
import { ReleaseSection } from "@/features/landing/components/release-section"
import { ScreenshotRail } from "@/features/landing/components/screenshot-rail"
import { SiteFooter } from "@/features/landing/components/site-footer"
import { SiteHeader } from "@/features/landing/components/site-header"
import {
  SITE_DESCRIPTION,
  SITE_TITLE,
  SOCIAL_IMAGE_URL,
} from "@/features/landing/constants"

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: SITE_TITLE },
      { name: "description", content: SITE_DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Ongaku" },
      { property: "og:title", content: SITE_TITLE },
      { property: "og:description", content: SITE_DESCRIPTION },
      { property: "og:image", content: SOCIAL_IMAGE_URL },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: SITE_TITLE },
      { name: "twitter:description", content: SITE_DESCRIPTION },
      { name: "twitter:image", content: SOCIAL_IMAGE_URL },
    ],
  }),
  component: LandingPage,
})

function LandingPage() {
  return (
    <div className="flex min-h-svh flex-col">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <SiteHeader />
      <main id="main" className="flex-1">
        <Hero />
        <FeatureStrip />
        <ScreenshotRail />
        <ReleaseSection />
      </main>
      <SiteFooter />
    </div>
  )
}
