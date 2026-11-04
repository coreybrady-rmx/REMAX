import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { brandName } from "./brand";
import { PLANS } from "./catalog";
import { COST_CATEGORIES, categoryLabel, type CostCategory } from "./categories";
import type { CommissionInput, CostLine, InvestorRule, ModelInput } from "./finance";

type Sql = DatabaseSync;

let database: Sql | null = null;

function dataDirectory(): string {
  const directory = process.env.VERCEL
    ? path.join("/tmp", "peaks-investor")
    : path.join(process.cwd(), "data");
  mkdirSync(directory, { recursive: true });
  return directory;
}

function databasePath(): string {
  return path.join(dataDirectory(), "portal.db");
}

export function getDb(): Sql {
  if (database) return database;
  const db = new DatabaseSync(databasePath());
  db.exec("PRAGMA foreign_keys = ON;");
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS plans (
      slug TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      stories INTEGER NOT NULL,
      beds REAL NOT NULL,
      baths REAL NOT NULL,
      living_sqft INTEGER NOT NULL,
      main_sqft INTEGER,
      upper_sqft INTEGER,
      basement_sqft INTEGER,
      basement_kind TEXT NOT NULL,
      garage_sqft INTEGER NOT NULL,
      garage_note TEXT NOT NULL,
      spec_note TEXT NOT NULL,
      strengths TEXT NOT NULL,
      tradeoffs TEXT NOT NULL,
      ideal_buyer TEXT NOT NULL,
      construction_notes TEXT NOT NULL,
      sort_order INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS resale_estimates (
      id TEXT PRIMARY KEY,
      plan_slug TEXT NOT NULL,
      market_area TEXT NOT NULL,
      lot_label TEXT,
      finish_level TEXT,
      basement_assumption TEXT,
      low_cents INTEGER,
      target_cents INTEGER,
      high_cents INTEGER,
      research_reference TEXT,
      estimated_on TEXT,
      internal_notes TEXT,
      visibility TEXT NOT NULL,
      approval TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      status TEXT NOT NULL,
      plan_slug TEXT,
      summary TEXT NOT NULL,
      address_line TEXT,
      address_public INTEGER NOT NULL DEFAULT 0,
      visibility TEXT NOT NULL,
      approval TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS scenarios (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      name TEXT NOT NULL,
      sale_price_cents INTEGER,
      duration_months INTEGER,
      monthly_carry_cents INTEGER,
      commission_mode TEXT NOT NULL,
      commission_inclusion TEXT NOT NULL,
      commission_cents INTEGER,
      commission_bps INTEGER,
      notes TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS budget_lines (
      id TEXT PRIMARY KEY,
      scenario_id TEXT NOT NULL,
      category TEXT NOT NULL,
      amount_cents INTEGER,
      inclusion TEXT NOT NULL,
      note TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS investor_terms (
      scenario_id TEXT PRIMARY KEY,
      capital_cents INTEGER,
      share_bps INTEGER,
      rule TEXT NOT NULL,
      repayment_text TEXT NOT NULL,
      participation_text TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS actual_results (
      project_id TEXT PRIMARY KEY,
      acquisition_cents INTEGER,
      construction_cents INTEGER,
      total_cost_cents INTEGER,
      sale_cents INTEGER,
      net_profit_cents INTEGER,
      holding_days INTEGER,
      investor_return_cents INTEGER,
      source_note TEXT NOT NULL,
      visibility TEXT NOT NULL,
      approval TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS inquiries (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      message TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      status TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS milestones (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      title TEXT NOT NULL,
      note TEXT NOT NULL,
      visibility TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS project_access (
      user_id TEXT NOT NULL,
      project_id TEXT NOT NULL,
      PRIMARY KEY (user_id, project_id)
    );
    CREATE TABLE IF NOT EXISTS media (
      id TEXT PRIMARY KEY,
      owner_type TEXT NOT NULL,
      owner_id TEXT NOT NULL,
      kind TEXT NOT NULL,
      storage_name TEXT NOT NULL,
      original_name TEXT NOT NULL,
      visibility TEXT NOT NULL,
      approval TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      project_id TEXT,
      title TEXT NOT NULL,
      storage_name TEXT NOT NULL,
      original_name TEXT NOT NULL,
      visibility TEXT NOT NULL,
      approval TEXT NOT NULL
    );
  `);
  seed(db);
  database = db;
  return db;
}

function id(): string {
  return randomBytes(16).toString("hex");
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 32).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const actual = scryptSync(password, salt, 32);
  const expected = Buffer.from(hash, "hex");
  if (actual.length !== expected.length) return false;
  return timingSafeEqual(actual, expected);
}

function seed(db: Sql) {
  const planCount = db.prepare("SELECT COUNT(*) AS count FROM plans").get() as { count: number };
  if (planCount.count === 0) {
    const insert = db.prepare(`INSERT INTO plans (
      slug, name, stories, beds, baths, living_sqft, main_sqft, upper_sqft, basement_sqft,
      basement_kind, garage_sqft, garage_note, spec_note, strengths, tradeoffs, ideal_buyer,
      construction_notes, sort_order
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    PLANS.forEach((plan, index) => {
      insert.run(
        plan.slug,
        plan.name,
        plan.stories,
        plan.beds,
        plan.baths,
        plan.livingSqft,
        plan.mainSqft,
        plan.upperSqft,
        plan.basementSqft,
        plan.basementKind,
        plan.garageSqft,
        plan.garageNote,
        plan.specNote,
        JSON.stringify(plan.strengths),
        JSON.stringify(plan.tradeoffs),
        plan.idealBuyer,
        plan.constructionNotes,
        index,
      );
    });
  }

  const adminEmail = (process.env.ADMIN_EMAIL || "corey@peaks.local").toLowerCase();
  const existingAdmin = db.prepare("SELECT id FROM users WHERE email = ?").get(adminEmail);
  if (!existingAdmin && process.env.ADMIN_PASSWORD) {
    db.prepare("INSERT INTO users (id, email, name, password_hash, role) VALUES (?, ?, ?, ?, ?)").run(
      id(),
      adminEmail,
      brandName,
      hashPassword(process.env.ADMIN_PASSWORD),
      "admin",
    );
  }

  const heritage = db.prepare("SELECT id FROM projects WHERE slug = ?").get("heritage-linden-lane");
  if (!heritage) seedHeritageDraft(db);
}

function seedHeritageDraft(db: Sql) {
  const projectId = id();
  const scenarioId = id();
  db.prepare(`INSERT INTO projects (
    id, slug, name, status, plan_slug, summary, address_line, address_public, visibility, approval
  ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, 'private', 'draft')`).run(
    projectId,
    "heritage-linden-lane",
    "Heritage — Linden Lane working underwriting",
    "proposed",
    "heritage",
    "Private working scenario from an internal prospectus. Land is an MLS asking price, not a closed purchase. Construction, soft costs, carry, contingency, and the sale target are underwriting assumptions. Investor capital and participation are not defined. The stated development cost does not include sales commission. This record is not approved for public display and is not a completed project.",
    "3115 N 1200 E, North Logan, UT",
    );
  db.prepare(`INSERT INTO scenarios (
    id, project_id, name, sale_price_cents, duration_months, monthly_carry_cents,
    commission_mode, commission_inclusion, commission_cents, commission_bps, notes
  ) VALUES (?, ?, ?, ?, NULL, NULL, 'percent', 'included', NULL, 500, ?)`).run(
    scenarioId,
    projectId,
    "Working underwriting",
    99_990_000,
    "Sale target and 5% commission are prospectus assumptions, not an approved developer resale estimate. Commission is outside the $1,000,000 development subtotal.",
  );
  const lines: Array<[CostCategory, number | null, "included" | "excluded" | "unknown", string]> = [
    ["land_acquisition", 16_500_000, "included", "MLS asking price in the prospectus. Not a closed acquisition."],
    ["site_development", null, "unknown", "Not separated in the prospectus."],
    ["excavation", null, "unknown", "Not separated in the prospectus."],
    ["utilities", null, "unknown", "Utilities were described as stubbed. No separate cost was entered."],
    ["architecture", null, "unknown", "Not separated from the bundled soft-cost assumption."],
    ["permits", 2_000_000, "included", "Bundled engineering, permits, and survey assumption."],
    ["hard_construction", 75_000_000, "included", "Underwriting assumption. Not a verified construction contract."],
    ["landscaping", null, "unknown", "Not included in the prospectus budget."],
    ["contingency", 2_000_000, "included", "Prospectus assumption."],
    ["builder_fees", null, "unknown", "Not stated separately. Do not assume the construction figure excludes or includes builder fees."],
    ["financing", 3_500_000, "included", "Bundled financing, interest, and carry assumption."],
    ["interest_carry", null, "excluded", "Left out of the sum because the financing line already bundles interest and carry."],
    ["taxes_insurance", 1_000_000, "included", "Bundled insurance, utilities, and miscellaneous assumption."],
    ["marketing", null, "unknown", "Not included in the prospectus budget."],
    ["closing", null, "unknown", "The prospectus says seller closing costs should be included and does not quantify them."],
  ];
  const insertLine = db.prepare(
    "INSERT INTO budget_lines (id, scenario_id, category, amount_cents, inclusion, note) VALUES (?, ?, ?, ?, ?, ?)",
  );
  for (const [category, amount, inclusion, note] of lines) {
    insertLine.run(id(), scenarioId, category, amount, inclusion, note);
  }
  db.prepare(`INSERT INTO investor_terms (
    scenario_id, capital_cents, share_bps, rule, repayment_text, participation_text
  ) VALUES (?, NULL, NULL, 'undefined', ?, ?)`).run(
    scenarioId,
    "Not defined in the prospectus.",
    "Not defined in the prospectus. No investor cash return is calculated.",
  );
}

export type PlanRow = {
  slug: string;
  name: string;
  stories: number;
  beds: number;
  baths: number;
  living_sqft: number;
  main_sqft: number | null;
  upper_sqft: number | null;
  basement_sqft: number | null;
  basement_kind: string;
  garage_sqft: number;
  garage_note: string;
  spec_note: string;
  strengths: string;
  tradeoffs: string;
  ideal_buyer: string;
  construction_notes: string;
};

export function listPlans(): PlanRow[] {
  return getDb().prepare("SELECT * FROM plans ORDER BY sort_order").all() as PlanRow[];
}

export function getPlan(slug: string): PlanRow | undefined {
  return getDb().prepare("SELECT * FROM plans WHERE slug = ?").get(slug) as PlanRow | undefined;
}

export type EstimateRow = {
  id: string;
  plan_slug: string;
  market_area: string;
  lot_label: string | null;
  finish_level: string | null;
  basement_assumption: string | null;
  low_cents: number | null;
  target_cents: number | null;
  high_cents: number | null;
  research_reference: string | null;
  estimated_on: string | null;
  internal_notes: string | null;
  visibility: string;
  approval: string;
};

export function publicEstimates(planSlug: string): EstimateRow[] {
  return getDb()
    .prepare(
      "SELECT * FROM resale_estimates WHERE plan_slug = ? AND visibility = 'public' AND approval = 'approved' ORDER BY market_area",
    )
    .all(planSlug) as EstimateRow[];
}

export function allEstimates(): EstimateRow[] {
  return getDb().prepare("SELECT * FROM resale_estimates ORDER BY plan_slug, market_area").all() as EstimateRow[];
}

export type ProjectRow = {
  id: string;
  slug: string;
  name: string;
  status: string;
  plan_slug: string | null;
  summary: string;
  address_line: string | null;
  address_public: number;
  visibility: string;
  approval: string;
};

export function publicProjects(): ProjectRow[] {
  return getDb()
    .prepare(
      "SELECT * FROM projects WHERE visibility = 'public' AND approval = 'approved' AND status != 'archived' ORDER BY name",
    )
    .all() as ProjectRow[];
}

export function completedPublicProjects(): ProjectRow[] {
  return getDb()
    .prepare(
      "SELECT * FROM projects WHERE visibility = 'public' AND approval = 'approved' AND status = 'completed' ORDER BY name",
    )
    .all() as ProjectRow[];
}

export function allProjects(): ProjectRow[] {
  return getDb().prepare("SELECT * FROM projects ORDER BY name").all() as ProjectRow[];
}

export function getProject(slug: string): ProjectRow | undefined {
  return getDb().prepare("SELECT * FROM projects WHERE slug = ?").get(slug) as ProjectRow | undefined;
}

export function getProjectById(projectId: string): ProjectRow | undefined {
  return getDb().prepare("SELECT * FROM projects WHERE id = ?").get(projectId) as ProjectRow | undefined;
}

export function userHasProjectGrant(userId: string, projectId: string): boolean {
  const access = getDb()
    .prepare("SELECT 1 AS ok FROM project_access WHERE user_id = ? AND project_id = ?")
    .get(userId, projectId) as { ok: number } | undefined;
  return Boolean(access);
}

export function userCanViewProject(userId: string, role: string, project: ProjectRow): boolean {
  if (role === "admin") return true;
  if (project.visibility === "public" && project.approval === "approved") return true;
  return userHasProjectGrant(userId, project.id);
}

export type ScenarioRow = {
  id: string;
  project_id: string;
  name: string;
  sale_price_cents: number | null;
  duration_months: number | null;
  monthly_carry_cents: number | null;
  commission_mode: string;
  commission_inclusion: string;
  commission_cents: number | null;
  commission_bps: number | null;
  notes: string;
};

export type BudgetLineRow = {
  id: string;
  scenario_id: string;
  category: string;
  amount_cents: number | null;
  inclusion: string;
  note: string;
};

export type InvestorTermsRow = {
  scenario_id: string;
  capital_cents: number | null;
  share_bps: number | null;
  rule: string;
  repayment_text: string;
  participation_text: string;
};

export function projectScenarios(projectId: string): ScenarioRow[] {
  return getDb().prepare("SELECT * FROM scenarios WHERE project_id = ? ORDER BY name").all(projectId) as ScenarioRow[];
}

export function scenarioLines(scenarioId: string): BudgetLineRow[] {
  const rows = getDb().prepare("SELECT * FROM budget_lines WHERE scenario_id = ?").all(scenarioId) as BudgetLineRow[];
  const order = new Map(COST_CATEGORIES.map(([key], index) => [key, index]));
  return rows.sort((a, b) => (order.get(a.category as CostCategory) ?? 99) - (order.get(b.category as CostCategory) ?? 99));
}

export function scenarioTerms(scenarioId: string): InvestorTermsRow | undefined {
  return getDb().prepare("SELECT * FROM investor_terms WHERE scenario_id = ?").get(scenarioId) as
    | InvestorTermsRow
    | undefined;
}

export function toModel(scenario: ScenarioRow, lines: BudgetLineRow[], terms: InvestorTermsRow | undefined): ModelInput {
  const inclusion = scenario.commission_inclusion as "included" | "excluded" | "unknown";
  const commission: CommissionInput =
    scenario.commission_mode === "percent"
      ? { mode: "percent", inclusion, bps: scenario.commission_bps }
      : scenario.commission_mode === "fixed"
        ? { mode: "fixed", inclusion, amountCents: scenario.commission_cents }
        : { mode: "none" };
  const investor: InvestorRule =
    terms?.rule === "profitShare"
      ? { kind: "profitShare", shareBps: terms.share_bps, capitalCents: terms.capital_cents }
      : { kind: "undefined" };
  return {
    lines: lines.map(
      (line): CostLine => ({
        id: line.category,
        label: categoryLabel(line.category),
        inclusion: line.inclusion as CostLine["inclusion"],
        amountCents: line.amount_cents,
      }),
    ),
    salePriceCents: scenario.sale_price_cents,
    commission,
    durationMonths: scenario.duration_months,
    monthlyCarryCents: scenario.monthly_carry_cents,
    investor,
  };
}

export type ActualRow = {
  project_id: string;
  acquisition_cents: number | null;
  construction_cents: number | null;
  total_cost_cents: number | null;
  sale_cents: number | null;
  net_profit_cents: number | null;
  holding_days: number | null;
  investor_return_cents: number | null;
  source_note: string;
  visibility: string;
  approval: string;
};

export function getActual(projectId: string): ActualRow | undefined {
  return getDb().prepare("SELECT * FROM actual_results WHERE project_id = ?").get(projectId) as ActualRow | undefined;
}

export function publicActual(projectId: string): ActualRow | undefined {
  const row = getActual(projectId);
  if (!row || row.visibility !== "public" || row.approval !== "approved" || !row.source_note.trim()) return undefined;
  return row;
}

export type InquiryRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  created_at: number;
  status: string;
};

export function listInquiries(): InquiryRow[] {
  return getDb().prepare("SELECT * FROM inquiries ORDER BY created_at DESC").all() as InquiryRow[];
}

export function createInquiry(input: { name: string; email: string; phone: string; message: string }) {
  getDb()
    .prepare("INSERT INTO inquiries (id, name, email, phone, message, created_at, status) VALUES (?, ?, ?, ?, ?, ?, 'new')")
    .run(id(), input.name, input.email, input.phone || null, input.message, Date.now());
}

export type UserRow = { id: string; email: string; name: string; password_hash: string; role: string };

export function findUserByEmail(email: string): UserRow | undefined {
  return getDb().prepare("SELECT * FROM users WHERE email = ?").get(email.toLowerCase()) as UserRow | undefined;
}

export function listInvestors(): UserRow[] {
  return getDb().prepare("SELECT * FROM users WHERE role = 'investor' ORDER BY email").all() as UserRow[];
}

export function assignedProjects(userId: string): ProjectRow[] {
  return getDb()
    .prepare(
      `SELECT projects.* FROM projects
       JOIN project_access ON project_access.project_id = projects.id
       WHERE project_access.user_id = ?
       ORDER BY projects.name`,
    )
    .all(userId) as ProjectRow[];
}

export type MilestoneRow = {
  id: string;
  project_id: string;
  title: string;
  note: string;
  visibility: string;
};

export function projectMilestones(projectId: string, includePrivate: boolean): MilestoneRow[] {
  const sql = includePrivate
    ? "SELECT * FROM milestones WHERE project_id = ?"
    : "SELECT * FROM milestones WHERE project_id = ? AND visibility = 'public'";
  return getDb().prepare(sql).all(projectId) as MilestoneRow[];
}

export type MediaRow = {
  id: string;
  owner_type: string;
  owner_id: string;
  kind: string;
  storage_name: string;
  original_name: string;
  visibility: string;
  approval: string;
};

export function visibleMedia(ownerType: string, ownerId: string, includePrivate: boolean): MediaRow[] {
  const sql = includePrivate
    ? "SELECT * FROM media WHERE owner_type = ? AND owner_id = ?"
    : "SELECT * FROM media WHERE owner_type = ? AND owner_id = ? AND visibility = 'public' AND approval = 'approved'";
  return getDb().prepare(sql).all(ownerType, ownerId) as MediaRow[];
}

export function getMedia(mediaId: string): MediaRow | undefined {
  return getDb().prepare("SELECT * FROM media WHERE id = ?").get(mediaId) as MediaRow | undefined;
}

export type DocumentRow = {
  id: string;
  project_id: string | null;
  title: string;
  storage_name: string;
  original_name: string;
  visibility: string;
  approval: string;
};

export function projectDocuments(projectId: string, includePrivate: boolean): DocumentRow[] {
  const sql = includePrivate
    ? "SELECT * FROM documents WHERE project_id = ?"
    : "SELECT * FROM documents WHERE project_id = ? AND visibility = 'public' AND approval = 'approved'";
  return getDb().prepare(sql).all(projectId) as DocumentRow[];
}

export function getDocument(documentId: string): DocumentRow | undefined {
  return getDb().prepare("SELECT * FROM documents WHERE id = ?").get(documentId) as DocumentRow | undefined;
}

export function storageRoot(): string {
  const directory = path.join(dataDirectory(), "uploads");
  mkdirSync(directory, { recursive: true });
  return directory;
}

export { id };
