import toast from "react-hot-toast"

export function infoToast(message: string) {
  toast(message, { position: "top-center", duration: 1000 })
}

export function errorToast(message: string) {
  toast(message, { position: "top-right", duration: 5000 })
}
