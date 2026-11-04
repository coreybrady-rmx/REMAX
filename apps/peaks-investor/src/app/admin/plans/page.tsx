import { setMediaApproval, uploadPrivateFile } from "@/app/actions";
import { BoundForm } from "@/components/BoundForm";
import { listPlans, visibleMedia } from "@/lib/db";

export const metadata = { title: "Plan media" };

export default async function AdminPlansPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const params = await searchParams;
  const plans = listPlans();
  return (
    <section className="space-y-8">
      <div>
        <h1 className="text-4xl">Plan drawings</h1>
        <p className="mt-3 max-w-2xl leading-7">
          Every upload starts private and unapproved. A drawing appears on the public plan page only after both switches
          are set. Alpine drawings from the source library are not loaded here.
        </p>
        {params.saved ? <p className="mt-3 text-sm font-semibold">Saved.</p> : null}
        {params.error ? <p className="mt-3 text-sm font-semibold text-brand">Choose a file under 20 MB.</p> : null}
      </div>
      {plans.map((plan) => {
        const media = visibleMedia("plan", plan.slug, true);
        return (
          <article key={plan.slug} className="bg-white p-5">
            <h2 className="text-2xl">{plan.name}</h2>
            <BoundForm action={uploadPrivateFile} className="mt-4 grid gap-3 md:grid-cols-3">
              <input type="hidden" name="owner_type" value="plan" />
              <input type="hidden" name="owner_id" value={plan.slug} />
              <label className="text-sm">
                Kind
                <select className="mt-1 w-full border border-ink/15 px-3 py-2" name="kind" defaultValue="drawing">
                  <option value="drawing">Drawing</option>
                  <option value="rendering">Rendering</option>
                </select>
              </label>
              <label className="text-sm md:col-span-2">
                File
                <input className="mt-1 w-full border border-ink/15 px-3 py-2" name="file" type="file" required />
              </label>
              <button className="rounded-full bg-ink px-4 py-2 text-sm font-bold text-white" type="submit">
              Upload private file
            </button>
            </BoundForm>
            <ul className="mt-4 space-y-3">
              {media.map((item) => (
                <li key={item.id} className="border-t border-ink/10 pt-3">
                  <BoundForm action={setMediaApproval} className="flex flex-wrap items-center gap-3 text-sm">
                    <input type="hidden" name="id" value={item.id} />
                    <span>
                      {item.kind}: {item.original_name}
                    </span>
                    <label className="flex items-center gap-2">
                      <input name="visibility" type="checkbox" value="public" defaultChecked={item.visibility === "public"} /> Public
                    </label>
                    <label className="flex items-center gap-2">
                      <input name="approval" type="checkbox" value="approved" defaultChecked={item.approval === "approved"} /> Approved
                    </label>
                    <button className="font-bold text-link" type="submit">
                      Update
                    </button>
                  </BoundForm>
                </li>
              ))}
            </ul>
          </article>
        );
      })}
    </section>
  );
}
