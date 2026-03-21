import toast from "react-hot-toast"

export function infoToast(message: string) {
  toast(message, {
    // putting toasts at the bottom so usually screen taps on mobile won't be
    // registered as hover events, causing the toast to stay onscreen until
    // the user taps again
    position: "bottom-center",
    duration: 2000,
    className:
      "!text-lg !bg-gray-200 border !rounded-lg !shadow-gray-500 !shadow-lg",
  })
}

export function errorToast(message: string) {
  toast(message, {
    // putting toasts at the bottom so usually screen taps on mobile won't be
    // registered as hover events, causing the toast to stay onscreen until
    // the user taps again
    position: "bottom-center",
    duration: 3500,
    className:
      "!text-lg !bg-gray-200 border !rounded-lg !shadow-gray-500 !shadow-lg",
  })
}
