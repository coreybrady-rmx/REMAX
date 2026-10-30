import { SearchInputError, searchActiveHomes } from "@/lib/search";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q") ?? "";
  const token = process.env.UTAH_MLS_TOKEN;
  if (!token) {
    return Response.json(
      { ok: false, error: "Home search is not connected yet. Call 435-278-1619 and the Logan office can look it up." },
      { status: 503 },
    );
  }

  try {
    const result = await searchActiveHomes(token, query);
    return Response.json({ ok: true, ...result });
  } catch (error) {
    if (error instanceof SearchInputError) {
      return Response.json({ ok: false, error: error.message }, { status: 400 });
    }
    return Response.json(
      { ok: false, error: "The listing search didn't respond. Try again in a moment." },
      { status: 502 },
    );
  }
}
