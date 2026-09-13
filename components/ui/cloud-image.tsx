"use client";

import Image, { type ImageProps } from "next/image";

const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

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
}) =>
  `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_${
    quality ?? "auto"
  },c_limit,w_${width}/${src}`;

export function CloudImage({ alt, ...props }: Omit<ImageProps, "loader">) {
  return <Image loader={cloudinaryLoader} alt={alt} {...props} />;
}
