import { readFileSync } from "node:fs";
import path from "node:path";
import { currentSession } from "@/lib/current";
import { getDocument, getProjectById, storageRoot, userHasProjectGrant } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const document = getDocument((await context.params).id);
  if (!document || !document.project_id) return new Response("Not found", { status: 404 });
  const project = getProjectById(document.project_id);
  const session = await currentSession();
  const published = document.visibility === "public" && document.approval === "approved" && project?.visibility === "public" && project.approval === "approved";
  const granted = Boolean(
    session &&
      document.project_id &&
      (session.role === "admin" || (document.approval === "approved" && userHasProjectGrant(session.sub, document.project_id))),
  );
  if (!published && !granted) return new Response("Not found", { status: 404 });
  const root = path.resolve(storageRoot());
  const filePath = path.resolve(root, document.storage_name);
  if (!filePath.startsWith(`${root}${path.sep}`)) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(readFileSync(filePath)), {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="${document.original_name.replaceAll('"', "")}"`,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, no-store",
    },
  });
}
