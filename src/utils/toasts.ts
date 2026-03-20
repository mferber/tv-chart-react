import toast from "react-hot-toast"

export function infoToast(message: string) {
  toast(message, {
    position: "top-center",
    duration: 1000,
    className:
      "!text-lg !bg-gray-200 border !rounded-lg !shadow-gray-500 !shadow-lg",
  })
}

export function errorToast(message: string) {
  toast(message, {
    position: "top-right",
    duration: 2000,
    className:
      "!text-lg !bg-gray-200 border !rounded-lg !shadow-gray-500 !shadow-lg",
  })
}
