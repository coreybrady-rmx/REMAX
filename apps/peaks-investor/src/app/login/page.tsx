import { signIn } from "@/app/actions";
import { BoundForm } from "@/components/BoundForm";
import { PageIntro } from "@/components/SiteChrome";

export const metadata = { title: "Investor login" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const params = await searchParams;
  return (
    <>
      <PageIntro eyebrow="Private access" title="Investor login">
        <p>Investors see only the projects assigned to them. Administrators manage the records.</p>
      </PageIntro>
      <section className="mx-auto max-w-md px-5 py-12">
        {params.error ? <p className="mb-4 border border-brand p-3 text-sm">That email and password did not match.</p> : null}
        <BoundForm action={signIn} className="grid gap-4">
          <input type="hidden" name="next" value={params.next ?? ""} />
          <label className="text-sm">
            Email
            <input className="mt-1 w-full border border-ink/15 px-3 py-2" name="email" type="email" required />
          </label>
          <label className="text-sm">
            Password
            <input className="mt-1 w-full border border-ink/15 px-3 py-2" name="password" type="password" required />
          </label>
          <button className="rounded-full bg-ink px-5 py-3 text-sm font-bold text-white uppercase" type="submit">
            Sign in
          </button>
        </BoundForm>
      </section>
    </>
  );
}
