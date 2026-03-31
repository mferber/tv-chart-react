import { clsx } from "clsx"
import React, { type ButtonHTMLAttributes } from "react"
import { ThreeDots } from "react-loader-spinner"

export function ThemedButton({
  htmlType,
  size,
  buttonStyle,
  onClick,
  disabled,
  spinner,
  children,
}: {
  htmlType: ButtonHTMLAttributes<HTMLButtonElement>["type"]
  size?: "normal" | "narrow"
  buttonStyle?: "primary" | "secondary"
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  disabled?: boolean
  spinner?: boolean
  children: React.ReactNode
}) {
  const tailwindClasses = clsx(
    "px-4",
    size === "narrow" ? "py-0" : "py-1.5",
    "border-1",

    // corners
    "rounded-md",

    // text
    buttonStyle === "secondary" ? "text-red-800" : "text-white",
    !disabled && buttonStyle === "secondary" && "hover:text-red-950",

    // background
    buttonStyle === "secondary" ? "bg-white" : "bg-red-800",
    !disabled &&
      (buttonStyle === "secondary" ? "hover:bg-red-100" : "hover:bg-red-950"),

    // border
    buttonStyle === "secondary" ? "border-0" : "border-red-800",
    !disabled && "hover:border-red-950",

    // cursor
    !disabled ? "hover:cursor-pointer" : "hover:cursor-not-allowed",

    // opacity
    disabled && "opacity-50",
  )
  const captionTailwindClasses = clsx(
    "row-start-1",
    "col-start-1",
    spinner && "invisible",
  )

  return (
    <button
      type={htmlType}
      className={tailwindClasses}
      onClick={onClick}
      disabled={disabled}
    >
      <div className="grid grid-rows-1 grid-cols-1 place-items-center">
        <div className={captionTailwindClasses}>{children}</div>
        {spinner && (
          <div className="row-start-1 col-start-1">
            <ThreeDots height="10" width="40" color="white" />
          </div>
        )}
      </div>
    </button>
  )
}
