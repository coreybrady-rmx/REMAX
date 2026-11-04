import { listInquiries } from "@/lib/db";

export const metadata = { title: "Inquiries" };

export default function InquiriesPage() {
  const inquiries = listInquiries();
  return (
    <section>
      <h1 className="text-4xl">Information requests</h1>
      <p className="mt-3 max-w-2xl leading-7">Requests are stored here. Nothing is emailed.</p>
      {inquiries.length === 0 ? <p className="mt-8">No requests yet.</p> : null}
      <ul className="mt-8 space-y-4">
        {inquiries.map((inquiry) => (
          <li key={inquiry.id} className="bg-white p-5">
            <p className="font-semibold">
              {inquiry.name} · {inquiry.email}
              {inquiry.phone ? ` · ${inquiry.phone}` : ""}
            </p>
            <p className="mt-2 text-sm text-ink/60">{new Date(inquiry.created_at).toLocaleString("en-US", { timeZone: "America/Denver" })} MT</p>
            <p className="mt-3 leading-7">{inquiry.message}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
