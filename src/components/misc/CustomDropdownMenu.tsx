import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import { clsx } from "clsx"
import { type ReactNode } from "react"

export function CustomDropdownMenuContent({
  children,
}: {
  children: ReactNode
}) {
  return (
    <DropdownMenu.Content
      className="z-50 bg-white border-2 rounded-lg py-2 shadow-gray-400 shadow-md sm:rounded-md"
      collisionPadding={16}
    >
      {children}
    </DropdownMenu.Content>
  )
}

export function CustomDropdownMenuItem({
  className,
  nonselectable,
  disabled,
  children,
}: {
  className?: string
  nonselectable?: boolean
  disabled?: boolean
  children: ReactNode
}) {
  return (
    <DropdownMenu.Item
      disabled={disabled ? true : undefined}
      className={clsx(
        "focus:outline-none w-full px-4 py-1 text-lg sm:py-0 sm:text-base",
        disabled && "text-gray-400/70",
        !disabled &&
          !nonselectable &&
          "hover:text-red-800 hover:bg-gray-300 cursor-pointer",
        (disabled || nonselectable) && "cursor-not-allowed",
        className,
      )}
    >
      {children}
    </DropdownMenu.Item>
  )
}

export function CustomDropdownMenuSeparator() {
  return <DropdownMenu.Separator className="h-px my-2 bg-gray-500 w-full" />
}
