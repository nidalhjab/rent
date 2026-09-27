export function cloudImageUrl(publicId: string, width: number, quality?: number) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const path = publicId.split("/").map(encodeURIComponent).join("/");
  return `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_${quality ?? "auto"},c_limit,w_${width}/${path}`;
}
