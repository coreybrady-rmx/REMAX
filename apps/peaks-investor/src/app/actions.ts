"use server";

import { randomBytes } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COST_CATEGORIES } from "@/lib/categories";
import {
  createInquiry,
  findUserByEmail,
  getDb,
  hashPassword,
  id,
  storageRoot,
  verifyPassword,
} from "@/lib/db";
import { parseCents } from "@/lib/format";
import { sessionCookiePath } from "@/lib/public-path";
import { createSessionToken, readSessionToken, SESSION_COOKIE } from "@/lib/session";

async function requireAdmin() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const session = await readSessionToken(token);
  if (!session || session.role !== "admin") redirect("/login?next=/admin");
  return session;
}

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const nextPath = String(formData.get("next") ?? "");
  const user = findUserByEmail(email);
  if (!user || !verifyPassword(password, user.password_hash)) {
    return { error: "That email and password did not match." };
  }
  const token = await createSessionToken({
    sub: user.id,
    email: user.email,
    role: user.role === "admin" ? "admin" : "investor",
  });
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: sessionCookiePath(),
    maxAge: 60 * 60 * 24 * 7,
  });
  const safeNext = nextPath.startsWith("/") && !nextPath.startsWith("//") ? nextPath : "";
  return { href: safeNext || (user.role === "admin" ? "/admin" : "/portal") };
}

export async function signOut() {
  (await cookies()).delete({ name: SESSION_COOKIE, path: sessionCookiePath() });
  redirect("/");
}

export async function submitInquiry(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  if (name.length < 2 || name.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || message.length < 10 || message.length > 4000) {
    return { error: "Check the name, email, and message, then try again." };
  }
  createInquiry({ name, email, phone, message });
  return { ok: "Your request is stored." };
}

export async function saveEstimate(formData: FormData) {
  await requireAdmin();
  const planSlug = String(formData.get("plan_slug") ?? "");
  const market = String(formData.get("market_area") ?? "").trim();
  if (!planSlug || market.length < 2) return { error: "Choose a plan and enter a market area." };
  const approval = formData.get("approval") === "approved" ? "approved" : "draft";
  const visibility = formData.get("visibility") === "public" ? "public" : "private";
  let low: number | null = null;
  let target: number | null = null;
  let high: number | null = null;
  try {
    low = parseCents(formData.get("low"));
    target = parseCents(formData.get("target"));
    high = parseCents(formData.get("high"));
  } catch {
    return { error: "Enter dollar amounts, or leave a price blank." };
  }
  const estimateId = String(formData.get("id") || id());
  getDb()
    .prepare(
      `INSERT INTO resale_estimates (
        id, plan_slug, market_area, lot_label, finish_level, basement_assumption,
        low_cents, target_cents, high_cents, research_reference, estimated_on, internal_notes, visibility, approval
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        plan_slug = excluded.plan_slug,
        market_area = excluded.market_area,
        lot_label = excluded.lot_label,
        finish_level = excluded.finish_level,
        basement_assumption = excluded.basement_assumption,
        low_cents = excluded.low_cents,
        target_cents = excluded.target_cents,
        high_cents = excluded.high_cents,
        research_reference = excluded.research_reference,
        estimated_on = excluded.estimated_on,
        internal_notes = excluded.internal_notes,
        visibility = excluded.visibility,
        approval = excluded.approval`,
    )
    .run(
      estimateId,
      planSlug,
      market,
      textOrNull(formData.get("lot_label")),
      textOrNull(formData.get("finish_level")),
      textOrNull(formData.get("basement_assumption")),
      low,
      target,
      high,
      textOrNull(formData.get("research_reference")),
      textOrNull(formData.get("estimated_on")),
      textOrNull(formData.get("internal_notes")),
      visibility,
      approval,
    );
  return { ok: "Estimate saved." };
}

export async function createProject(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const slug = slugify(String(formData.get("slug") || name));
  const planSlug = textOrNull(formData.get("plan_slug"));
  if (name.length < 2 || !slug) return { error: "Enter a project name." };
  const projectId = id();
  const scenarioId = id();
  const db = getDb();
  db.prepare(
    `INSERT INTO projects (id, slug, name, status, plan_slug, summary, address_line, address_public, visibility, approval)
     VALUES (?, ?, ?, 'proposed', ?, '', NULL, 0, 'private', 'draft')`,
  ).run(projectId, slug, name, planSlug);
  db.prepare(
    `INSERT INTO scenarios (
      id, project_id, name, sale_price_cents, duration_months, monthly_carry_cents,
      commission_mode, commission_inclusion, commission_cents, commission_bps, notes
    ) VALUES (?, ?, 'Base', NULL, NULL, NULL, 'none', 'included', NULL, NULL, '')`,
  ).run(scenarioId, projectId);
  const insertLine = db.prepare(
    "INSERT INTO budget_lines (id, scenario_id, category, amount_cents, inclusion, note) VALUES (?, ?, ?, NULL, 'unknown', '')",
  );
  for (const [category] of COST_CATEGORIES) insertLine.run(id(), scenarioId, category);
  db.prepare(
    `INSERT INTO investor_terms (scenario_id, capital_cents, share_bps, rule, repayment_text, participation_text)
     VALUES (?, NULL, NULL, 'undefined', '', '')`,
  ).run(scenarioId);
  return { href: `/admin/projects/${slug}` };
}

export async function saveProject(formData: FormData) {
  await requireAdmin();
  const slug = String(formData.get("slug") ?? "");
  const status = String(formData.get("status") ?? "proposed");
  if (!["proposed", "active", "completed", "archived"].includes(status)) return { error: "Choose a project status." };
  getDb()
    .prepare(
      `UPDATE projects SET name = ?, status = ?, plan_slug = ?, summary = ?, address_line = ?, address_public = ?, visibility = ?, approval = ? WHERE slug = ?`,
    )
    .run(
      String(formData.get("name") ?? "").trim(),
      status,
      textOrNull(formData.get("plan_slug")),
      String(formData.get("summary") ?? ""),
      textOrNull(formData.get("address_line")),
      formData.get("address_public") === "1" ? 1 : 0,
      formData.get("visibility") === "public" ? "public" : "private",
      formData.get("approval") === "approved" ? "approved" : "draft",
      slug,
    );
  return { ok: "Saved." };
}

export async function saveScenario(formData: FormData) {
  await requireAdmin();
  const scenarioId = String(formData.get("scenario_id") ?? "");
  const slug = String(formData.get("slug") ?? "");
  const db = getDb();
  let sale: number | null = null;
  let carry: number | null = null;
  let capital: number | null = null;
  try {
    sale = parseCents(formData.get("sale_price"));
    carry = parseCents(formData.get("monthly_carry"));
    capital = parseCents(formData.get("capital"));
  } catch {
    return { error: "Leave unknown amounts blank. Use a dollar amount or a whole number of months." };
  }
  const durationText = String(formData.get("duration_months") ?? "").trim();
  const duration = durationText ? Number(durationText) : null;
  if (durationText && !Number.isInteger(duration)) return { error: "Enter the holding period as a whole number of months, or leave it blank." };
  const commissionMode = String(formData.get("commission_mode") ?? "none");
  const bpsText = String(formData.get("commission_bps") ?? "").trim();
  const bps = bpsText ? Number(bpsText) : null;
  let commissionCents: number | null = null;
  try {
    commissionCents = parseCents(formData.get("commission_cents"));
  } catch {
    return { error: "Leave unknown amounts blank. Use a dollar amount or a whole number of months." };
  }
  const commissionInclusion = String(formData.get("commission_inclusion") ?? "included");
  db.prepare(
    `UPDATE scenarios SET sale_price_cents = ?, duration_months = ?, monthly_carry_cents = ?, commission_mode = ?, commission_inclusion = ?, commission_cents = ?, commission_bps = ?, notes = ? WHERE id = ?`,
  ).run(
    sale,
    duration,
    carry,
    commissionMode === "percent" || commissionMode === "fixed" ? commissionMode : "none",
    commissionInclusion === "excluded" || commissionInclusion === "unknown" ? commissionInclusion : "included",
    commissionCents,
    bps,
    String(formData.get("notes") ?? ""),
    scenarioId,
  );
  for (const [category] of COST_CATEGORIES) {
    let amount: number | null = null;
    try {
      amount = parseCents(formData.get(`amount_${category}`));
    } catch {
      return { error: "Leave unknown amounts blank. Use a dollar amount or a whole number of months." };
    }
    const inclusion = String(formData.get(`inclusion_${category}`) ?? "unknown");
    db.prepare("UPDATE budget_lines SET amount_cents = ?, inclusion = ?, note = ? WHERE scenario_id = ? AND category = ?").run(
      amount,
      inclusion === "included" || inclusion === "excluded" ? inclusion : "unknown",
      String(formData.get(`note_${category}`) ?? ""),
      scenarioId,
      category,
    );
  }
  const rule = formData.get("investor_rule") === "profitShare" ? "profitShare" : "undefined";
  const shareText = String(formData.get("share_bps") ?? "").trim();
  db.prepare(
    `UPDATE investor_terms SET capital_cents = ?, share_bps = ?, rule = ?, repayment_text = ?, participation_text = ? WHERE scenario_id = ?`,
  ).run(
    capital,
    shareText ? Number(shareText) : null,
    rule,
    String(formData.get("repayment_text") ?? ""),
    String(formData.get("participation_text") ?? ""),
    scenarioId,
  );
  return { ok: "Saved." };
}

export async function saveActual(formData: FormData) {
  await requireAdmin();
  const projectId = String(formData.get("project_id") ?? "");
  const slug = String(formData.get("slug") ?? "");
  const fields = ["acquisition", "construction", "total_cost", "sale", "net_profit", "investor_return"] as const;
  const values: Array<number | null> = [];
  try {
    for (const field of fields) values.push(parseCents(formData.get(field)));
  } catch {
    return { error: "Leave unknown amounts blank. Use a dollar amount or a whole number of months." };
  }
  const holdingText = String(formData.get("holding_days") ?? "").trim();
  const holding = holdingText ? Number(holdingText) : null;
  getDb()
    .prepare(
      `INSERT INTO actual_results (
        project_id, acquisition_cents, construction_cents, total_cost_cents, sale_cents, net_profit_cents,
        holding_days, investor_return_cents, source_note, visibility, approval
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(project_id) DO UPDATE SET
        acquisition_cents = excluded.acquisition_cents,
        construction_cents = excluded.construction_cents,
        total_cost_cents = excluded.total_cost_cents,
        sale_cents = excluded.sale_cents,
        net_profit_cents = excluded.net_profit_cents,
        holding_days = excluded.holding_days,
        investor_return_cents = excluded.investor_return_cents,
        source_note = excluded.source_note,
        visibility = excluded.visibility,
        approval = excluded.approval`,
    )
    .run(
      projectId,
      ...values,
      holding,
      String(formData.get("source_note") ?? ""),
      formData.get("visibility") === "public" ? "public" : "private",
      formData.get("approval") === "approved" ? "approved" : "draft",
    );
  return { ok: "Saved." };
}

export async function addMilestone(formData: FormData) {
  await requireAdmin();
  const slug = String(formData.get("slug") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { error: "Enter a milestone title." };
  getDb()
    .prepare("INSERT INTO milestones (id, project_id, title, note, visibility) VALUES (?, ?, ?, ?, ?)")
    .run(
      id(),
      String(formData.get("project_id")),
      title,
      String(formData.get("note") ?? ""),
      formData.get("visibility") === "public" ? "public" : "private",
    );
  return { ok: "Saved." };
}

export async function grantAccess(formData: FormData) {
  await requireAdmin();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const name = String(formData.get("name") ?? "").trim() || email;
  const password = String(formData.get("password") ?? "");
  const projectId = String(formData.get("project_id") ?? "");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !projectId) return { error: "Check the email and project." };
  const db = getDb();
  let user = findUserByEmail(email);
  if (!user) {
    if (password.length < 8) return { error: "A new investor needs a password of at least eight characters." };
    const userId = id();
    db.prepare("INSERT INTO users (id, email, name, password_hash, role) VALUES (?, ?, ?, ?, 'investor')").run(
      userId,
      email,
      name,
      hashPassword(password),
    );
    user = findUserByEmail(email);
  }
  if (!user) return { error: "The investor account could not be saved." };
  db.prepare("INSERT OR IGNORE INTO project_access (user_id, project_id) VALUES (?, ?)").run(user.id, projectId);
  return { ok: "Access saved." };
}

export async function uploadPrivateFile(formData: FormData) {
  await requireAdmin();
  const file = formData.get("file");
  const slug = String(formData.get("slug") ?? "");
  if (!(file instanceof File) || file.size === 0 || file.size > 20_000_000) {
    return { error: "Choose a file under 20 MB." };
  }
  const storageName = `${randomBytes(16).toString("hex")}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "")}`;
  const root = storageRoot();
  mkdirSync(root, { recursive: true });
  writeFileSync(path.join(root, storageName), Buffer.from(await file.arrayBuffer()));
  const kind = String(formData.get("kind") ?? "document");
  const approval = "draft";
  const visibility = "private";
  if (kind === "document") {
    getDb()
      .prepare(
        "INSERT INTO documents (id, project_id, title, storage_name, original_name, visibility, approval) VALUES (?, ?, ?, ?, ?, ?, ?)",
      )
      .run(id(), String(formData.get("project_id")), String(formData.get("title") || file.name), storageName, file.name, visibility, approval);
  } else {
    getDb()
      .prepare(
        "INSERT INTO media (id, owner_type, owner_id, kind, storage_name, original_name, visibility, approval) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      )
      .run(
        id(),
        String(formData.get("owner_type") ?? "plan"),
        String(formData.get("owner_id")),
        kind,
        storageName,
        file.name,
        visibility,
        approval,
      );
  }
  return { ok: "File stored as a private draft." };
}

export async function setMediaApproval(formData: FormData) {
  await requireAdmin();
  getDb()
    .prepare("UPDATE media SET visibility = ?, approval = ? WHERE id = ?")
    .run(
      formData.get("visibility") === "public" ? "public" : "private",
      formData.get("approval") === "approved" ? "approved" : "draft",
      String(formData.get("id")),
    );
  return { ok: "Drawing status saved." };
}

function textOrNull(value: FormDataEntryValue | null): string | null {
  const text = String(value ?? "").trim();
  return text ? text : null;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}
