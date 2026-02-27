import { useState } from "react"

import NoImage from "../../assets/no_image.png"

// via Claude
export function ImageWithPlaceholder({
  src,
  alt,
  widthClassName,
  placeholderHeightClassName,
  additionalClassNames,
}: {
  src: string | null
  alt?: string
  widthClassName: string
  placeholderHeightClassName: string
  additionalClassNames?: string
}) {
  const [loaded, setLoaded] = useState(false)

  const divClassNames = [
    widthClassName,
    "min-" + widthClassName,
    "max-" + widthClassName,
    loaded ? "" : placeholderHeightClassName,
    loaded ? "bg-transparent" : "bg-gray-200",
    additionalClassNames,
  ].join(" ")

  const imgClassNames = [
    widthClassName,
    loaded ? "block" : "hidden",
    additionalClassNames,
  ].join(" ")

  return (
    <div className={divClassNames}>
      <img
        src={src ?? NoImage}
        alt={alt}
        className={imgClassNames}
        onLoad={() => setLoaded(true)}
      />
    </div>
  )
}
