"use client";

import Image, { type ImageProps } from "next/image";
import { cloudImageUrl } from "@/lib/image-url";

/**
 * Resizing happens on Cloudinary's CDN rather than through `/_next/image`, so
 * `src` is a Cloudinary `public_id` instead of a URL.
 */
const cloudinaryLoader = ({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) => cloudImageUrl(src, width, quality);

export function CloudImage({ alt, ...props }: Omit<ImageProps, "loader">) {
  return <Image loader={cloudinaryLoader} alt={alt} {...props} />;
}
