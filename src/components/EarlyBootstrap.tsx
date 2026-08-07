"use client";

import "@/utils/earlyBrowserPatches";
import "@/utils/patchAptosGetChainId";

/** Side-effect-only bootstrap: runs fetch/SW patches before the rest of the app. */
export function EarlyBootstrap() {
  return null;
}
