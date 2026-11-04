import { submitInquiry } from "@/app/actions";
import { BoundForm } from "@/components/BoundForm";
import { PageIntro } from "@/components/SiteChrome";

export const metadata = { title: "Investor contact" };

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; error?: string }>;
}) {
  const params = await searchParams;
  return (
    <>
      <PageIntro eyebrow="Contact" title="Request an investment overview">
        <p>The message is saved for review. It is not emailed automatically, and it is not a subscription agreement.</p>
      </PageIntro>
      <section className="mx-auto max-w-xl px-5 py-12">
        {params.sent ? <p className="mb-4 border border-ink/10 bg-paper p-3">Your request is stored.</p> : null}
        {params.error ? <p className="mb-4 border border-brand p-3">Check the name, email, and message, then try again.</p> : null}
        <BoundForm action={submitInquiry} className="grid gap-4">
          <label className="text-sm">
            Name
            <input className="mt-1 w-full border border-ink/15 px-3 py-2" name="name" required />
          </label>
          <label className="text-sm">
            Email
            <input className="mt-1 w-full border border-ink/15 px-3 py-2" name="email" type="email" required />
          </label>
          <label className="text-sm">
            Phone, optional
            <input className="mt-1 w-full border border-ink/15 px-3 py-2" name="phone" />
          </label>
          <label className="text-sm">
            What do you want to review?
            <textarea className="mt-1 w-full border border-ink/15 px-3 py-2" name="message" rows={6} required />
          </label>
          <button className="rounded-full bg-brand px-5 py-3 text-sm font-bold text-white uppercase" type="submit">
            Submit request
          </button>
        </BoundForm>
      </section>
    </>
  );
}
