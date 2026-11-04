import { brandName } from "@/lib/brand";
import { allProjects, listInquiries, listPlans } from "@/lib/db";

export const metadata = { title: "Admin" };

export default function AdminHome() {
  return (
    <section>
      <h1 className="text-4xl">{brandName} records</h1>
      <p className="mt-3 max-w-2xl leading-7">
        Public pages show a plan price only after an estimate is marked public and approved. Projects, drawings, and
        documents stay private until the same two switches are set. Actual results also need a source note.
      </p>
      <dl className="mt-8 grid gap-4 sm:grid-cols-3">
        <Stat label="Floor plans" value={String(listPlans().length)} />
        <Stat label="Projects" value={String(allProjects().length)} />
        <Stat label="Inquiries" value={String(listInquiries().length)} />
      </dl>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white p-5">
      <dt className="text-sm text-ink/60">{label}</dt>
      <dd className="text-3xl">{value}</dd>
    </div>
  );
}
