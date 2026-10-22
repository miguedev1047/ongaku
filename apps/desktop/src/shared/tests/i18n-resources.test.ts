import { describe, expect, it } from "vitest"

import i18n, { defaultNS, resources } from "@/lib/i18n"
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

describe("desktop i18n resources", () => {
  it("keeps the 548 leaf keys", () => {
    expect(flatten(en)).toHaveLength(548)
    expect(flatten(es)).toHaveLength(548)
  })

  it("keeps key parity between languages", () => {
    expect(flatten(es).sort()).toEqual(flatten(en).sort())
  })

  it("keeps the translation namespace and runtime", () => {
    expect(defaultNS).toBe("translation")
    expect(resources.en.translation).toBe(en)
    expect(resources.es.translation).toBe(es)
    expect(i18n.isInitialized).toBe(true)
    expect(i18n.t("common.cancel")).toBe("Cancel")
  })
})
