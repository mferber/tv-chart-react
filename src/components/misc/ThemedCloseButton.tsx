import clsx from "clsx"
import { X } from "lucide-react"
import { twMerge } from "tailwind-merge"

export function ThemedCloseButton({
  onClick,
  variant,
  classNameOverride,
}: {
  onClick: () => void
  variant?: "normal" | "dark"
  classNameOverride?: string
}) {
  const className = twMerge(
    clsx(
      "w-min h-min text-sm p-2 ml-2 mb-2 rounded-full",
      variant === "dark"
        ? "bg-stone-300 hover:bg-stone-400"
        : "bg-stone-200 hover:bg-stone-300",
      classNameOverride ?? null,
    ),
  )
  return (
    <div className={className} onClick={onClick}>
      <X size="20" />
    </div>
  )
}
