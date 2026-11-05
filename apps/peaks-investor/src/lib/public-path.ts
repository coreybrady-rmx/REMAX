function normalizedBase(value: string | undefined): string {
  return value?.replace(/\/$/, "") ?? "";
}

/** Path attribute for the session cookie. Browsers only clear a cookie when this matches the path it was set with. */
export function sessionCookiePath(
  basePath: string | undefined = process.env.NEXT_PUBLIC_BASE_PATH,
): string {
  return normalizedBase(basePath) || "/";
}

/** Prefix a root-relative public URL when the portal is mounted under a path. */
export function publicPath(
  src: string,
  basePath: string | undefined = process.env.NEXT_PUBLIC_BASE_PATH,
): string {
  const base = normalizedBase(basePath);
  if (!base || !src.startsWith("/") || src.startsWith("//") || src.startsWith(`${base}/`) || src === base) {
    return src;
  }
  return `${base}${src}`;
}
