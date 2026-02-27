import { focusManager } from "@tanstack/react-query"

/**
 * Sets up window listeners to better handle different browsers when triggering
 * Tanstack Query's automatic background refetch on window focus. Different
 * browsers (at least Chrome and Safari) handle these events very differently,
 * so not all cases will trigger background refetch when you might want them to.
 */
export function setUpBackgroundRefetchFocusEvents() {
  focusManager.setEventListener((handleFocus) => {
    if (typeof window === "undefined") return

    function onVisibilityChange() {
      handleFocus(!document.hidden)
    }

    function onFocus() {
      handleFocus(true)
    }

    function onBlur() {
      handleFocus(false)
    }

    // Chrome: responds to tab switches (app and window switches appear to be untrappable)
    document.addEventListener("visibilitychange", onVisibilityChange)

    // Safari: responds to focus changes instead of relying on visibilitychange
    window.addEventListener("focus", onFocus)
    window.addEventListener("blur", onBlur)

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange)
      window.removeEventListener("focus", onFocus)
      window.removeEventListener("blur", onBlur)
    }
  })
}
