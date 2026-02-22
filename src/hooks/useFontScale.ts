"use client";

import { useState, useEffect } from "react";

export type FontScale = "small" | "normal" | "large" | "xl";

const SCALE_MAP: Record<FontScale, string> = {
  small: "14px",
  normal: "16px",
  large: "18px",
  xl: "20px",
};

const STORAGE_KEY = "fr-font-scale";

export function useFontScale() {
  const [scale, setScaleState] = useState<FontScale>("normal");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as FontScale | null;
    if (stored && stored in SCALE_MAP) {
      setScaleState(stored);
      document.documentElement.style.fontSize = SCALE_MAP[stored];
    }
  }, []);

  const setScale = (newScale: FontScale) => {
    setScaleState(newScale);
    localStorage.setItem(STORAGE_KEY, newScale);
    document.documentElement.style.fontSize = SCALE_MAP[newScale];
  };

  return { scale, setScale };
}
