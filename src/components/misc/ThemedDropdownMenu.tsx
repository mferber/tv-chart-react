import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import { clsx } from "clsx"
import { type ReactNode } from "react"
import { twMerge } from "tailwind-merge"

export function ThemedDropdownMenuContent({
  children,
}: {
  children: ReactNode
}) {
  return (
    <DropdownMenu.Content
      className="z-50 bg-white font-light border rounded-lg py-2 shadow-gray-400 shadow-md sm:rounded-md"
      collisionPadding={16}
    >
      {children}
    </DropdownMenu.Content>
  )
}

export function ThemedDropdownMenuItem({
  classNameOverride,
  nonselectable,
  disabled,
  onSelect,
  children,
}: {
  classNameOverride?: string
  nonselectable?: boolean
  disabled?: boolean
  onSelect?: () => void
  children: ReactNode
}) {
  return (
    <DropdownMenu.Item
      disabled={disabled ? true : undefined}
      className={twMerge(
        clsx(
          "focus:outline-none w-full px-4 py-1 text-lg sm:py-0 sm:text-base",
          disabled
            ? "text-gray-300 cursor-not-allowed"
            : nonselectable
              ? "cursor-default"
              : "hover:text-red-800 hover:bg-stone-200 cursor-pointer",
          classNameOverride,
        ),
      )}
      onSelect={onSelect}
    >
      {children}
    </DropdownMenu.Item>
  )
}

export function ThemedDropdownMenuSeparator({
  classNameOverride,
}: {
  classNameOverride?: string
}) {
  const classname = twMerge(
    clsx("h-px my-2 bg-gray-500 w-full", classNameOverride),
  )
  return <DropdownMenu.Separator className={classname} />
}
