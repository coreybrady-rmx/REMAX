import { readFileSync } from "node:fs";
import path from "node:path";
import { currentSession } from "@/lib/current";
import { getMedia, getProjectById, storageRoot, userHasProjectGrant } from "@/lib/db";

export const dynamic = "force-dynamic";

const types: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".pdf": "application/pdf",
};

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const media = getMedia((await context.params).id);
  if (!media) return new Response("Not found", { status: 404 });
  const session = await currentSession();
  const published = media.visibility === "public" && media.approval === "approved";
  let allowed = published;
  if (!allowed && session?.role === "admin") allowed = true;
  if (!allowed && session && media.owner_type === "project" && media.approval === "approved") {
    const project = getProjectById(media.owner_id);
    allowed = Boolean(project && userHasProjectGrant(session.sub, project.id));
  }
  if (!allowed) return new Response("Not found", { status: 404 });
  const root = path.resolve(storageRoot());
  const filePath = path.resolve(root, media.storage_name);
  if (!filePath.startsWith(`${root}${path.sep}`)) return new Response("Not found", { status: 404 });
  const extension = path.extname(media.original_name).toLowerCase();
  return new Response(new Uint8Array(readFileSync(filePath)), {
    headers: {
      "Content-Type": types[extension] ?? "application/octet-stream",
      "Content-Disposition": `inline; filename="${media.original_name.replaceAll('"', "")}"`,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, no-store",
    },
  });
}
