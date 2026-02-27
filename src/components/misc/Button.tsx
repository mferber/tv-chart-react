import { clsx } from "clsx"
import React, { type ButtonHTMLAttributes } from "react"
import { ThreeDots } from "react-loader-spinner"

export function Button({
  htmlType,
  onClick,
  disabled,
  spinner,
  children,
}: {
  htmlType: ButtonHTMLAttributes<HTMLButtonElement>["type"]
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  disabled?: boolean
  spinner?: boolean
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
