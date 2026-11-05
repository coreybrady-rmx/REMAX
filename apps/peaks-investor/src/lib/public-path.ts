const base = process.env.NEXT_PUBLIC_BASE_PATH?.replace(/\/$/, "") ?? "";

/** Prefix a root-relative public URL when the portal is mounted under a path. */
export function publicPath(src: string): string {
  if (!base || !src.startsWith("/") || src.startsWith("//") || src.startsWith(`${base}/`) || src === base) {
    return src;
  }
  return `${base}${src}`;
}
