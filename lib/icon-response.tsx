import { ImageResponse } from "next/og";
import { brandIconDataUri } from "@/lib/brand-icon";

/** Rasterises the brand SVG at build time, so no image tooling is needed. */
export function iconResponse(size: number) {
  return new ImageResponse(
    (
      // `next/image` has no meaning inside satori; a raw element is required.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={brandIconDataUri}
        alt=""
        width={size}
        height={size}
        style={{ width: size, height: size }}
      />
    ),
    { width: size, height: size },
  );
}
