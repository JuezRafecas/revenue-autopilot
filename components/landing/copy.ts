import type { Segment } from '@/lib/types';

/* ─────────────────────────────────────────────────────────────
   Landing copy + illustrative numbers.
   Sourced from hackathon-knowledge-base.md. Plain EN strings.
   Segment config is imported directly from lib/constants at the
   component level — never duplicated here.
   ───────────────────────────────────────────────────────────── */

// §04 — The problem
export interface ProblemStat {
  value: string;
  valueNumeric: number;
  suffix?: string;
  prefix?: string;
  label: string;
  sub: string;
}

export const PROBLEM_STATS: ProblemStat[] = [
  {
    value: '70',
    valueNumeric: 70,
    suffix: '%',
    label: 'Of guests never become loyal to your brand',
    sub: 'Churn runs 70–95% depending on the format',
  },
  {
    value: '45',
    valueNumeric: 45,
    suffix: ' days',
    label: 'Average time for an active guest to go dormant',
    sub: 'No alert, no action',
  },
  {
    value: '79',
    valueNumeric: 79,
    label: 'Signals per guest the system already computes',
    sub: 'RFM, frequency, section, language, scores',
  },
  {
    value: '500',
    valueNumeric: 500,
    suffix: '+',
    label: 'Real restaurants feeding the model',
    sub: 'Argentina · Chile · Uruguay · Brazil · Mexico',
  },
];

export const PROBLEM_PULL_QUOTE =
  'They operate well. They sell below their potential. They have thousands of guests and rely on Instagram to bring anyone back.';

// §05 — Lifecycle Switcher
export interface LifecycleSample {
  name: string;
  subtitle: string;
  trait: string;
}

export interface LifecycleDemo {
  volume: number;
  trend: 'up' | 'down' | 'flat';
  trendLabel: string;
  action: string;
  metric: string;
  sample: LifecycleSample;
}

export const LIFECYCLE_DEMO: Record<Segment, LifecycleDemo> = {
  lead: {
    volume: 820,
    trend: 'up',
    trendLabel: '+12% vs last month',
    action: 'Convert to a first visit with a welcome flow',
    metric: 'Lead-to-guest conversion rate',
    sample: {
      name: 'Valentina R.',
      subtitle: 'WhatsApp inquiry · no bookings',
      trait: 'Browses the menu on Fridays',
    },
  },
  new: {
    volume: 380,
    trend: 'up',
    trendLabel: '+8% vs last month',
    action: 'Drive the second visit before day 21',
    metric: 'Second-visit rate',
    sample: {
      name: 'Matías T.',
      subtitle: '1 visit · 6 days ago',
      trait: 'Came on a Thursday with his partner',
    },
  },
  active: {
    volume: 1240,
    trend: 'flat',
    trendLabel: 'Steady',
    action: 'Hold the pace, ask for a review, deepen the relationship',
    metric: 'Visit frequency',
    sample: {
      name: 'Lucía P.',
      subtitle: '9 visits · last one 14 days ago',
      trait: 'Bar regular, Friday nights',
    },
  },
  at_risk: {
    volume: 620,
    trend: 'down',
    trendLabel: '−6% vs last month',
    action: 'Preventive recovery before they go dormant',
    metric: 'Recovery rate',
    sample: {
      name: 'Federico A.',
      subtitle: '4 visits · last one 32 days ago',
      trait: 'His usual cadence was 12 days',
    },
  },
  dormant: {
    volume: 4532,
    trend: 'down',
    trendLabel: 'The biggest pool',
    action: 'Reactivate with nostalgia and warmth, no discounts',
    metric: 'Revenue recovered',
    sample: {
      name: 'Juan P.',
      subtitle: '7 visits · last one 58 days ago',
      trait: 'Prefers Thursday nights, bar section',
    },
  },
  vip: {
    volume: 210,
    trend: 'up',
    trendLabel: '+3% vs last month',
    action: 'Exclusive experiences, event invitations',
    metric: 'Frequency × average ticket',
    sample: {
      name: 'María L.',
      subtitle: '18 visits · avg ticket $82k',
      trait: 'Books for 6 on Saturdays',
    },
  },
};

// §06 — How Claude decides (4 phases)
export interface ClaudePhase {
  kicker: string;
  title: string;
  body: string;
  detail: string;
  accent: string;
}

export const CLAUDE_PHASES: ClaudePhase[] = [
  {
    kicker: '01',
    title: 'Detect',
    body: 'Nomi continuously analyzes restaurant data and answers a single question: what revenue opportunity exists today?',
    detail: 'A VIP who hasn\u2019t visited in 50 days · 8 empty tables for tomorrow · a cluster of first-timers who never came back.',
    accent: '#5b8def',
  },
  {
    kicker: '02',
    title: 'Decide',
    body: 'Every decision is explicit: audience, objective, channel, timing, incentive, and success metric.',
    detail: 'Picks specific guests, not abstract segments. Chooses WhatsApp or email. Defines the send window.',
    accent: '#0e5e48',
  },
  {
    kicker: '03',
    title: 'Personalize',
    body: 'Generates messages with real guest context: name, history, preferences, tone, and language.',
    detail: 'Nostalgia for reactivation. Celebration for post-visit. No discounts by default — incentives are the last resort.',
    accent: '#e6784c',
  },
  {
    kicker: '04',
    title: 'Execute and learn',
    body: 'Sends, respects frequency rules, tracks response, and attributes real revenue to every action.',
    detail: 'The outcome feeds next month\u2019s decisions. The system tunes itself.',
    accent: '#f0a04b',
  },
];

// §07 — WhatsApp demo
export interface GuestContext {
  guest_name: string;
  restaurant_name: string;
  total_visits: number;
  days_since_last_visit: number;
  avg_days_between_visits: number;
  preferred_day: string;
  preferred_shift: string;
  preferred_sector: string;
  last_score: number;
  lifecycle_state: Segment;
  guest_language: 'en' | 'es' | 'pt';
}

export const WHATSAPP_DEMO: {
  guest: GuestContext;
  message: string;
  delivery: string;
} = {
  guest: {
    guest_name: 'Juan Pérez',
    restaurant_name: 'La Cabrera',
    total_visits: 7,
    days_since_last_visit: 58,
    avg_days_between_visits: 18,
    preferred_day: 'thursday',
    preferred_shift: 'evening',
    preferred_sector: 'bar',
    last_score: 4.5,
    lifecycle_state: 'dormant',
    guest_language: 'en',
  },
  message:
    'Hi Juan 👋\nIt\u2019s been a while since we\u2019ve seen you at La Cabrera.\nThis week we have a seat at the bar waiting for you 😉\nWant to stop by on a Thursday?',
  delivery: 'Delivered · read',
};

// §07 — channel table
export interface ChannelStat {
  channel: string;
  openRate: string;
  openRateNumeric: number;
  conversion: string;
  conversionNumeric: number;
  note: string;
}

export const CHANNEL_STATS: ChannelStat[] = [
  {
    channel: 'Email',
    openRate: '20–30%',
    openRateNumeric: 25,
    conversion: '2–5%',
    conversionNumeric: 3.5,
    note: 'Useful as a complement',
  },
  {
    channel: 'SMS',
    openRate: '70–80%',
    openRateNumeric: 75,
    conversion: '10–20%',
    conversionNumeric: 15,
    note: 'Invasive and generic',
  },
  {
    channel: 'WhatsApp',
    openRate: '95–99%',
    openRateNumeric: 97,
    conversion: '45–60%',
    conversionNumeric: 52,
    note: 'LATAM\u2019s native channel',
  },
  {
    channel: 'Voice',
    openRate: '60–75%',
    openRateNumeric: 68,
    conversion: '55–70%',
    conversionNumeric: 62,
    note: 'VIP reactivation · human touch',
  },
];

// §08 — 5 foundational moments
export interface UseCase {
  rank: string;
  title: string;
  mode: 'Automatic' | 'Manual' | 'Automatic (opt-in)' | 'Manual → Automatic';
  trigger: string;
  action: string;
  metric: string;
  tileVariant: 'mint' | 'royal' | 'sun' | 'terra' | 'green';
}

export const USE_CASES: UseCase[] = [
  {
    rank: '01',
    title: 'Smart post-visit',
    mode: 'Automatic',
    trigger: 'The guest just finished their visit',
    action: 'Adaptive flow: thank you → review → invitation to return',
    metric: 'Review rate · second visits · revenue generated',
    tileVariant: 'mint',
  },
  {
    rank: '02',
    title: 'First → second visit',
    mode: 'Automatic',
    trigger: 'First visit detected in the last 7 days',
    action: 'Targeted outreach focused on conversion — incentive only if the data justifies it',
    metric: 'Second-visit rate · time to return',
    tileVariant: 'royal',
  },
  {
    rank: '03',
    title: 'Dormant reactivation',
    mode: 'Automatic (opt-in)',
    trigger: '2+ prior visits and no visit in 45–60 days',
    action: 'Nostalgia + warmth, a single channel (WhatsApp), no discounts up front',
    metric: 'Reactivation rate · revenue recovered',
    tileVariant: 'terra',
  },
  {
    rank: '04',
    title: 'Promote an event',
    mode: 'Manual',
    trigger: 'The restaurant selects an event or experience',
    action: 'Nomi suggests the audience and writes the message — it gets sent',
    metric: 'Bookings generated · event revenue',
    tileVariant: 'sun',
  },
  {
    rank: '05',
    title: 'Fill tables on slow days',
    mode: 'Manual → Automatic',
    trigger: 'Low-occupancy pattern detected',
    action: 'Invites guests who historically come on that day, or who have flexibility',
    metric: 'Incremental occupancy · incremental revenue',
    tileVariant: 'green',
  },
];

// §09 — Revenue mockup
export interface RevenueLine {
  label: string;
  sent: number;
  converted: number;
  revenue: number;
  accent: string;
}

export const REVENUE_MOCKUP: {
  total: number;
  month: string;
  lines: RevenueLine[];
} = {
  total: 2350000,
  month: 'Revenue generated this month',
  lines: [
    {
      label: 'Dormant reactivation',
      sent: 312,
      converted: 47,
      revenue: 1880000,
      accent: '#e6784c',
    },
    {
      label: 'Smart post-visit',
      sent: 890,
      converted: 28,
      revenue: 470000,
      accent: '#0e5e48',
    },
  ],
};

// §10 — Differentiation
export interface DiffRow {
  them: string;
  us: string;
}

export const DIFFERENTIATION: DiffRow[] = [
  {
    them: 'Tools to send messages',
    us: 'A system that decides what to send, to whom, and when',
  },
  {
    them: 'Manual campaign builder',
    us: 'Approve, don\u2019t configure',
  },
  {
    them: 'Email + SMS as the main channels',
    us: 'WhatsApp-native with 95%+ open rates in LATAM',
  },
  {
    them: 'Engagement metrics',
    us: 'Incremental revenue metrics',
  },
  {
    them: 'Requires a full-time marketer',
    us: 'Works without a marketer',
  },
  {
    them: 'Manual segmentation',
    us: 'Automatic lifecycle-based audiences',
  },
  {
    them: 'Generic copy',
    us: 'Messages personalized by Nomi',
  },
];

// §11 — 5 commandments
export interface Mandamiento {
  rank: string;
  title: string;
  body: string;
}

export const MANDAMIENTOS: Mandamiento[] = [
  {
    rank: '01',
    title: 'Revenue > activity',
    body: 'If it doesn\u2019t move revenue, it doesn\u2019t matter. Open rate and click rate are not business metrics.',
  },
  {
    rank: '02',
    title: 'Closed decisions',
    body: 'The restaurant approves or rejects. No configuration. Fewer options, more impact.',
  },
  {
    rank: '03',
    title: 'Automation with control',
    body: 'Determinism first. Generative AI as support, not as the brain. Everything can be explained, turned off, and measured.',
  },
  {
    rank: '04',
    title: 'Fully white-labeled',
    body: 'The restaurant feels that "the system takes care of it." It should never feel like a complex tool.',
  },
  {
    rank: '05',
    title: 'Infrastructure as leverage',
    body: 'Everything non-differentiating is bought or outsourced. We don\u2019t build what someone else has already solved.',
  },
];

// Section headers
export const SECTION_HEADERS = {
  problema: {
    eyebrow: 'The problem',
    title: 'The revenue walking out the door\nwhile no one is watching.',
    lead: 'Restaurants have thousands of guests on file but no systematic recurrence. They have the data and do nothing with it. They lose revenue to silent churn.',
  },
  lifecycle: {
    eyebrow: 'Lifecycle',
    title: 'Six states.\nSix concrete actions.',
    lead: 'Every guest lives in an operational state — not analytical, actionable. Nomi triggers the right action without you having to think about segments.',
  },
  metodo: {
    eyebrow: 'How Nomi decides',
    title: 'A commercial brain,\nnot a chatbot.',
    lead: 'Nomi operates in four continuous phases: detect, decide, personalize, and execute. Every decision is explicit and trackable.',
  },
  whatsapp: {
    eyebrow: 'Nomi writes like an owner',
    title: 'The message is not\ngeneric copy.',
    lead: 'With real guest context, Nomi writes messages the restaurant owner would sign. No default discounts, no corporate tone, no fake urgency.',
  },
  casos: {
    eyebrow: 'V1 use cases',
    title: 'Five foundational\nmoments.',
    lead: 'Chosen because together they cover the entire lifecycle, mix automatic and manual actions, and deliver results in the short term.',
  },
  impacto: {
    eyebrow: 'What you see at month-end',
    title: 'The only number\nthat matters.',
    lead: 'Incremental revenue generated by the system. Revenue that wouldn\u2019t exist without Nomi\u2019s decisions. We don\u2019t optimize anything that doesn\u2019t move this number.',
  },
  diff: {
    eyebrow: 'Competitive landscape',
    title: 'Everyone sells tools.\nWe sell outcomes.',
    lead: 'Nothing like this exists in Latin America. Global competitors are still stuck in the "campaign builder" paradigm that requires human configuration.',
  },
  cta: {
    eyebrow: 'The five commandments',
    title: 'Approve,\ndon\u2019t configure.',
    lead: 'Not a CRM. Not a campaign manager. An autonomous revenue agent that turns scattered data into actions with real economic impact.',
  },
} as const;
