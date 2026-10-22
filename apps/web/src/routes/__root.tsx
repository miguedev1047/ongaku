import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router"
import logo from "@ongaku/assets/logo"

import appCss from "@/styles/main.css?url"
import { SITE_DESCRIPTION, SITE_NAME } from "@/features/landing/constants"

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      { title: SITE_NAME },
      { name: "description", content: SITE_DESCRIPTION },
      { name: "theme-color", content: "#0a0a0a" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/png", href: logo },
      { rel: "apple-touch-icon", href: logo },
      { rel: "manifest", href: "/manifest.json" },
    ],
  }),
  notFoundComponent: NotFound,
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}

function NotFound() {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-xl flex-col items-start justify-center gap-4 px-4">
      <p className="text-2xs font-medium tracking-widest text-muted-foreground uppercase">
        404
      </p>
      <h1 className="landing-display font-heading text-3xl font-semibold">
        This track does not exist.
      </h1>
      <p className="text-sm text-muted-foreground">
        The page you are looking for may have moved or never existed.
      </p>
      <a
        href="/"
        className="mt-2 rounded-sm text-sm font-medium underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring/50"
      >
        Back to Ongaku
      </a>
    </main>
  )
}
