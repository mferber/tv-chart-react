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
      className="bg-gray-200 border rounded-md py-2"
      collisionPadding={16}
    >
      {children}
    </DropdownMenu.Content>
  )
}

export function CustomDropdownMenuItem({
  className,
  selectable,
  children,
}: {
  className?: string
  selectable?: boolean
  children: ReactNode
}) {
  return (
    <DropdownMenu.Item
      className={clsx(
        "focus:outline-none w-full px-4 py-1 text-lg",
        selectable && "hover:text-red-800 cursor-pointer",
        !selectable && "cursor-not-allowed",
        className,
      )}
    >
      {children}
    </DropdownMenu.Item>
  )
}
