/**
 * Deterministic demo CSV generator for La Cabrera.
 * Output: data/demo-visits.csv (one row per visit)
 *
 * Distribution per spec:
 *   5% leads / 10% new / 15% active / 5% VIP / 15% at_risk / 50% dormant
 *   ~600 guests, ~2500 visit rows, span ~18 months (anchored at 2026-04-14)
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';

// --- Deterministic PRNG (mulberry32) ---------------------------------------
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(0xc0ffee);

const randInt = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min;
const randFloat = (min: number, max: number) => rand() * (max - min) + min;
const pick = <T>(arr: T[]): T => arr[Math.floor(rand() * arr.length)]!;

// --- Name pools ------------------------------------------------------------
const FIRST_NAMES = [
  'Valentina','Martín','Lucía','Joaquín','Camila','Federico','Sofía','Nicolás','Milagros','Tomás',
  'Agustina','Bruno','Juliana','Santiago','Victoria','Ignacio','Rocío','Facundo','Florencia','Matías',
  'Micaela','Alejandro','Paula','Diego','Laura','Sebastián','Carolina','Mariano','Delfina','Julián',
  'Antonella','Gonzalo','Brenda','Emiliano','Catalina','Leandro','Ariana','Franco','Renata','Esteban',
  'Abril','Gastón','Morena','Lautaro','Priscila','Rodrigo','Jazmín','Cristian','Martina','Guillermo',
  'Malena','Ramiro','Pilar','Hernán','Solange','Agustín','Romina','Ezequiel','Lourdes','Damián',
  'Constanza','Mariano','Bianca','Nahuel','Aldana','Tobías','Mercedes','Axel','Guadalupe','Iván',
  'Luciana','Mauro','Candela','Thiago','Alma','Luciano','Vera','Pedro','Ayelén','Cristina',
];

const LAST_NAMES = [
  'Romero','Álvarez','Fernández','Méndez','Ibáñez','Paz','Benítez','Ortega','Acosta','Giménez',
  'Sosa','Cabrera','Pereyra','Molina','Gutiérrez','Ramírez','Herrera','Silva','Vázquez','Medina',
  'Aguirre','Luna','Castro','Moreno','Navarro','Ruiz','Jiménez','Torres','Flores','Rivero',
  'Núñez','Vega','Ledesma','Ponce','Villalba','Ramos','Carrizo','Maldonado','Figueroa','Peralta',
  'Ojeda','Godoy','Salazar','Quiroga','Arias','Bianchi','Rossi','Bianco','Russo','Ferrari',
  'Lombardi','Greco','Costa','Marino','Conti','Bruno','Esposito','Colombo','Ricci','Moretti',
  'Gallo','Barbieri','Mancini','Gómez','Martínez','Rodríguez','López','González','Pérez','Sánchez',
  'Iglesias','Castro','Ortiz','Reyes','Chávez','Domínguez','Vargas','Ramos','Rojas','Soto',
];

const DAYS = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
const SHIFTS = ['lunch','dinner'] as const;
const SECTORS = ['salón','terraza','barra','privado'];

// --- Types -----------------------------------------------------------------
type Segment = 'vip' | 'active' | 'new' | 'at_risk' | 'dormant' | 'lead';

interface GuestSpec {
  name: string;
  phone: string;
  email: string;
  segment: Segment;
  // behavior profile
  preferredShift: 'lunch' | 'dinner';
  preferredSector: string;
  preferredDay: string;
  avgPartySize: number;
  avgAmount: number;
  // visit cadence in days
  cadence: number;
  // how far back their history stretches (days)
  historyDays: number;
  // last visit offset (days ago from ANCHOR). 0 = today, 180 = 6mo ago
  lastVisitDaysAgo: number;
  // total number of visits to emit
  totalVisits: number;
}

interface VisitRow {
  guest_name: string;
  phone: string;
  email: string;
  visit_date: string;
  party_size: number;
  amount: number;
  shift: string;
  day_of_week: string;
  sector: string;
  visit_type: string;
  outcome: string;
  score: string;
}

// --- Config ----------------------------------------------------------------
const ANCHOR = new Date('2026-04-14T12:00:00Z');

const SEGMENT_COUNTS: Record<Segment, number> = {
  vip: 31,
  active: 90,
  new: 60,
  at_risk: 92,
  dormant: 308,
  lead: 32,
};

// --- Helpers ---------------------------------------------------------------
function uniqueName(used: Set<string>): string {
  for (let i = 0; i < 2000; i++) {
    const name = `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
    if (!used.has(name)) {
      used.add(name);
      return name;
    }
  }
  const uniq = `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)} ${used.size}`;
  used.add(uniq);
  return uniq;
}

function makePhone(): string {
  const a = randInt(4000, 7999);
  const b = randInt(1000, 9999);
  return `+54 9 11 ${a}-${b}`;
}

function makeEmail(name: string): string {
  const providers = ['gmail.com', 'gmail.com', 'gmail.com', 'hotmail.com', 'yahoo.com.ar', 'outlook.com'];
  const clean = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z ]/g, '')
    .trim()
    .replace(/ /g, '.');
  const suffix = rand() < 0.5 ? String(randInt(10, 99)) : '';
  return `${clean}${suffix}@${pick(providers)}`;
}

function dayOfWeekKey(d: Date): string {
  return DAYS[d.getUTCDay() === 0 ? 6 : d.getUTCDay() - 1]!;
}

function addDays(d: Date, days: number): Date {
  const copy = new Date(d);
  copy.setUTCDate(copy.getUTCDate() + days);
  return copy;
}

// --- Guest spec builders ---------------------------------------------------
function buildGuestSpec(segment: Segment, name: string): GuestSpec {
  const phone = makePhone();
  const email = makeEmail(name);
  const preferredShift = rand() < 0.65 ? 'dinner' : 'lunch';
  const preferredSector = pick(SECTORS);
  const preferredDay = pick(DAYS);
  const avgPartySize = Math.max(2, Math.round(randFloat(1.8, 4.6)));

  let cadence: number;
  let totalVisits: number;
  let lastVisitDaysAgo: number;
  let historyDays: number;
  let avgAmount: number;

  switch (segment) {
    case 'vip':
      cadence = randInt(7, 10);
      totalVisits = randInt(18, 42);
      lastVisitDaysAgo = randInt(0, 14);
      historyDays = randInt(240, 540);
      avgAmount = randFloat(60_000, 120_000);
      break;
    case 'active':
      cadence = randInt(15, 25);
      totalVisits = randInt(4, 12);
      lastVisitDaysAgo = randInt(0, 30);
      historyDays = randInt(120, 480);
      avgAmount = randFloat(25_000, 60_000);
      break;
    case 'new':
      cadence = 0;
      totalVisits = 1;
      lastVisitDaysAgo = randInt(1, 30);
      historyDays = 30;
      avgAmount = randFloat(20_000, 55_000);
      break;
    case 'at_risk':
      cadence = randInt(18, 28);
      totalVisits = randInt(4, 10);
      lastVisitDaysAgo = randInt(38, 58);
      historyDays = randInt(200, 420);
      avgAmount = randFloat(25_000, 55_000);
      break;
    case 'dormant':
      cadence = randInt(20, 45);
      totalVisits = randInt(2, 14);
      lastVisitDaysAgo = randInt(60, 540);
      historyDays = randInt(180, 540);
      avgAmount = randFloat(20_000, 70_000);
      break;
    case 'lead':
      cadence = 0;
      totalVisits = 1; // one cancelled/no-show row
      lastVisitDaysAgo = randInt(5, 90);
      historyDays = 90;
      avgAmount = randFloat(20_000, 50_000);
      break;
  }

  return {
    name,
    phone,
    email,
    segment,
    preferredShift,
    preferredSector,
    preferredDay,
    avgPartySize,
    avgAmount,
    cadence,
    historyDays,
    lastVisitDaysAgo,
    totalVisits,
  };
}

// --- Visit row builders ----------------------------------------------------
function emitVisitsForGuest(g: GuestSpec): VisitRow[] {
  const rows: VisitRow[] = [];
  const lastVisit = addDays(ANCHOR, -g.lastVisitDaysAgo);

  if (g.segment === 'lead') {
    // One cancelled reservation attempt
    const d = lastVisit;
    rows.push({
      guest_name: g.name,
      phone: g.phone,
      email: g.email,
      visit_date: d.toISOString(),
      party_size: g.avgPartySize,
      amount: 0,
      shift: g.preferredShift,
      day_of_week: dayOfWeekKey(d),
      sector: g.preferredSector,
      visit_type: 'reservation',
      outcome: rand() < 0.5 ? 'cancelled' : 'no_show',
      score: '',
    });
    return rows;
  }

  if (g.segment === 'new') {
    const d = lastVisit;
    rows.push(makeCompletedRow(g, d));
    return rows;
  }

  // For all other segments, emit visits backwards from lastVisit on cadence
  let cursor = lastVisit;
  for (let i = 0; i < g.totalVisits; i++) {
    // small jitter on cadence
    const jitter = i === 0 ? 0 : Math.round(randFloat(-g.cadence * 0.2, g.cadence * 0.2));
    if (i > 0) cursor = addDays(cursor, -(g.cadence + jitter));
    // stop if we go before history window
    const daysFromAnchor = Math.abs((cursor.getTime() - ANCHOR.getTime()) / 86_400_000);
    if (daysFromAnchor > g.historyDays) break;
    // occasional no-show or cancel
    const r = rand();
    if (r < 0.04) {
      rows.push({
        ...makeCompletedRow(g, cursor),
        outcome: 'no_show',
        amount: 0,
        score: '',
      });
      continue;
    }
    if (r < 0.07) {
      rows.push({
        ...makeCompletedRow(g, cursor),
        outcome: 'cancelled',
        amount: 0,
        score: '',
      });
      continue;
    }
    rows.push(makeCompletedRow(g, cursor));
  }
  return rows;
}

function makeCompletedRow(g: GuestSpec, d: Date): VisitRow {
  const partyJitter = Math.max(1, g.avgPartySize + (rand() < 0.5 ? 0 : randInt(-1, 2)));
  const amountJitter = g.avgAmount * randFloat(0.75, 1.25);
  const stickyShift = rand() < 0.78 ? g.preferredShift : g.preferredShift === 'dinner' ? 'lunch' : 'dinner';
  const stickySector = rand() < 0.7 ? g.preferredSector : pick(SECTORS);
  const hasScore = rand() < 0.22;
  const score = hasScore
    ? (Math.round(randFloat(3.4, 5.0) * 2) / 2).toFixed(1)
    : '';
  // anchor to the hour based on shift
  const hour = stickyShift === 'dinner' ? randInt(20, 23) : randInt(12, 15);
  const visit = new Date(d);
  visit.setUTCHours(hour, randInt(0, 59), 0, 0);

  return {
    guest_name: g.name,
    phone: g.phone,
    email: g.email,
    visit_date: visit.toISOString(),
    party_size: partyJitter,
    amount: Math.round(amountJitter * partyJitter),
    shift: stickyShift,
    day_of_week: dayOfWeekKey(visit),
    sector: stickySector,
    visit_type: 'reservation',
    outcome: 'completed',
    score,
  };
}

// --- Main ------------------------------------------------------------------
function main() {
  const usedNames = new Set<string>();
  const specs: GuestSpec[] = [];
  for (const [segment, count] of Object.entries(SEGMENT_COUNTS) as [Segment, number][]) {
    for (let i = 0; i < count; i++) {
      specs.push(buildGuestSpec(segment, uniqueName(usedNames)));
    }
  }

  // Shuffle guest spec order a bit so the CSV doesn't group by segment
  for (let i = specs.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [specs[i], specs[j]] = [specs[j]!, specs[i]!];
  }

  const rows: VisitRow[] = [];
  for (const g of specs) {
    rows.push(...emitVisitsForGuest(g));
  }
  // Sort chronologically (oldest first) for sanity
  rows.sort((a, b) => a.visit_date.localeCompare(b.visit_date));

  const header = 'guest_name,phone,email,visit_date,party_size,amount,shift,day_of_week,sector,visit_type,outcome,score';
  const csvLines = [header];
  for (const r of rows) {
    csvLines.push(
      [
        csvEscape(r.guest_name),
        csvEscape(r.phone),
        csvEscape(r.email),
        r.visit_date,
        String(r.party_size),
        r.amount ? String(r.amount) : '',
        r.shift ?? '',
        r.day_of_week ?? '',
        r.sector ?? '',
        r.visit_type,
        r.outcome,
        r.score,
      ].join(',')
    );
  }

  const out = resolve(process.cwd(), 'data/demo-visits.csv');
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, csvLines.join('\n') + '\n', 'utf-8');

  // Report distribution
  const counts: Record<string, number> = {};
  for (const g of specs) counts[g.segment] = (counts[g.segment] ?? 0) + 1;

  console.log('\n✓ Generated data/demo-visits.csv');
  console.log(`  Guests:   ${specs.length}`);
  console.log(`  Visits:   ${rows.length}`);
  console.log(`  Segments:`);
  for (const seg of Object.keys(SEGMENT_COUNTS)) {
    console.log(`    ${seg.padEnd(10)} ${String(counts[seg] ?? 0).padStart(4)}`);
  }
}

function csvEscape(v: string): string {
  if (v.includes(',') || v.includes('"')) {
    return `"${v.replace(/"/g, '""')}"`;
  }
  return v;
}

main();
