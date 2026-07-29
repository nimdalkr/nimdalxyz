/**
 * Decides whether a visitor gets the experience, and how much of it.
 *
 * The stage is the experience, but it can never be the only way to read this
 * site. The readable pages are what the server sends; the canvas is an upgrade
 * applied on top, and only when the device can actually carry it.
 */

export type AtlasTier = "off" | "lite" | "full";

export type AtlasCapability = {
  tier: AtlasTier;
  reason: string;
};

function hasWebGL2(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2"));
  } catch {
    return false;
  }
}

type LowPowerNavigator = Navigator & { deviceMemory?: number };

export function detectAtlasCapability(): AtlasCapability {
  if (typeof window === "undefined") {
    return { tier: "off", reason: "server" };
  }

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return { tier: "off", reason: "reduced-motion" };
  }

  if (!hasWebGL2()) {
    return { tier: "off", reason: "no-webgl2" };
  }

  const nav = navigator as LowPowerNavigator;
  const memory = nav.deviceMemory ?? 8;
  const cores = nav.hardwareConcurrency ?? 8;

  if (memory <= 2 || cores <= 2) {
    return { tier: "off", reason: "low-power-device" };
  }

  // Phones run the stage, but at a lower pixel ratio.
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  if (coarse || window.innerWidth < 768 || memory <= 4 || cores <= 4) {
    return { tier: "lite", reason: coarse ? "touch-device" : "modest-hardware" };
  }

  return { tier: "full", reason: "capable" };
}

/** Render budget per tier, so the stage has one place to ask. */
export const ATLAS_BUDGET = {
  lite: { dpr: [1, 1.5] as [number, number] },
  full: { dpr: [1, 2] as [number, number] }
} as const;

export const ATLAS_STORAGE_KEY = "nimdal-atlas-mode";
