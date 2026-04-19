import * as React from "react"
import { getEffectiveMobileState, getStoredDevicePreference, isNativeApp } from "@/utils/platformDetection"

const MOBILE_BREAKPOINT = 1024

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(() => {
    // Check stored preference first, then compute from device
    return getEffectiveMobileState()
  })

  React.useEffect(() => {
    // If user has explicit preference or running in native app, no need to listen for changes
    const stored = getStoredDevicePreference()
    if (stored !== null || isNativeApp()) {
      return
    }

    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return isMobile
}
