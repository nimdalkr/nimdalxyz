"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import type { AtlasLandmark } from "@/lib/atlas/world";
import {
  ATLAS_STORAGE_KEY,
  detectAtlasCapability,
  type AtlasTier
} from "@/lib/atlas/capability";
import type { Locale } from "@/lib/content";

/**
 * Chooses between the sea and the page.
 *
 * The readable portfolio is the server-rendered child. It is always in the DOM
 * first, so search engines, screen readers, and anyone without WebGL get the
 * real content with no JavaScript involved. The atlas is loaded only after the
 * client confirms the device can carry it, and the visitor can always leave it.
 */

const AtlasStage = dynamic(
  () => import("@/components/atlas/AtlasStage").then((m) => m.AtlasStage),
  { ssr: false }
);

interface AtlasGateProps {
  locale: Locale;
  landmarks: AtlasLandmark[];
  children: React.ReactNode;
}

type Mode = "pending" | "atlas" | "readable";

export function AtlasGate({ locale, landmarks, children }: AtlasGateProps) {
  const [mode, setMode] = useState<Mode>("pending");
  const [tier, setTier] = useState<AtlasTier>("off");

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = window.localStorage.getItem(ATLAS_STORAGE_KEY);
    } catch {
      // Storage can be blocked; fall through to capability detection.
    }

    if (stored === "readable") {
      setMode("readable");
      return;
    }

    const capability = detectAtlasCapability();
    setTier(capability.tier);
    setMode(capability.tier === "off" ? "readable" : "atlas");
  }, []);

  const leaveAtlas = () => {
    try {
      window.localStorage.setItem(ATLAS_STORAGE_KEY, "readable");
    } catch {
      // Non-fatal: the choice simply will not persist.
    }
    setMode("readable");
  };

  const enterAtlas = () => {
    try {
      window.localStorage.removeItem(ATLAS_STORAGE_KEY);
    } catch {
      // Non-fatal.
    }
    const capability = detectAtlasCapability();
    setTier(capability.tier);
    if (capability.tier !== "off") setMode("atlas");
  };

  // Until the client has decided, the server's readable markup stands as-is.
  if (mode === "atlas") {
    return (
      <AtlasStage
        locale={locale}
        landmarks={landmarks}
        tier={tier === "lite" ? "lite" : "full"}
        onExit={leaveAtlas}
      />
    );
  }

  return (
    <>
      {children}
      {mode === "readable" ? <AtlasReturn locale={locale} onEnter={enterAtlas} /> : null}
    </>
  );
}

/** Offers the sea to anyone reading the flat page, without nagging. */
function AtlasReturn({ locale, onEnter }: { locale: Locale; onEnter: () => void }) {
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    setAvailable(detectAtlasCapability().tier !== "off");
  }, []);

  if (!available) return null;

  return (
    <button type="button" className="atlas-return" onClick={onEnter}>
      {locale === "ko" ? "바다로 들어가기" : "Enter the sea"}
    </button>
  );
}
