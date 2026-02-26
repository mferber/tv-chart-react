import { clsx } from "clsx"
import React, { type ButtonHTMLAttributes } from "react"

export function Button({
  htmlType,
  onClick,
  disabled,
  children,
}: {
  htmlType: ButtonHTMLAttributes<HTMLButtonElement>["type"]
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  disabled?: boolean
  children: React.ReactNode
}) {
  const tailwindClasses = clsx(
    "px-4",
    "py-1",
    "border-2",
    "rounded-md",
    "text-white",

    "bg-red-800",
    !disabled && "hover:bg-red-950",

    "border-red-800",
    !disabled && "hover:border-red-950",

    !disabled ? "hover:cursor-pointer" : "hover:cursor-not-allowed",

    disabled && "opacity-50",
  )

  return (
    <button
      type={htmlType}
      className={tailwindClasses}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}
