import { describe, expect, it } from "vitest"

import i18n, {
  defaultNS,
  resources,
  supportedLanguages,
} from "@/lib/i18n"
import en from "@/locales/en.json"
import es from "@/locales/es.json"

type Json = Record<string, unknown>

function flatten(value: Json, prefix = ""): string[] {
  return Object.entries(value).flatMap(([key, child]) => {
    const path = prefix ? `${prefix}.${key}` : key
    if (child && typeof child === "object" && !Array.isArray(child)) {
      return flatten(child as Json, path)
    }
    return [path]
  })
}

describe("web i18n resources", () => {
  it("keeps only the web namespaces", () => {
    const namespaces = ["common", "downloads", "footer", "landing", "navigation"]

    expect(Object.keys(en).sort()).toEqual(namespaces)
    expect(Object.keys(es).sort()).toEqual(namespaces)
  })

  it("keeps key parity between languages", () => {
    expect(flatten(es).sort()).toEqual(flatten(en).sort())
  })

  it("initializes a single instance with the expected defaults", () => {
    expect(defaultNS).toBe("common")
    expect(supportedLanguages).toEqual(["en", "es"])
    expect(resources.en).toBe(en)
    expect(resources.es).toBe(es)
    expect(i18n.isInitialized).toBe(true)
  })

  it("translates with a fixed language without mutating the instance", () => {
    const tEn = i18n.getFixedT("en", "navigation")
    const tEs = i18n.getFixedT("es", "navigation")

    expect(tEn("download")).toBe("Download")
    expect(tEs("download")).toBe("Descargar")
  })
})
