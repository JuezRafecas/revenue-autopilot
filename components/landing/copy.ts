import type { Segment } from '@/lib/types';

/* ─────────────────────────────────────────────────────────────
   Landing copy + illustrative numbers.
   Sourced from hackathon-knowledge-base.md. Plain ES strings.
   Segment config is imported directly from lib/constants at the
   component level — never duplicated here.
   ───────────────────────────────────────────────────────────── */

// §04 — El problema
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
    label: 'De los comensales nunca se fideliza con tu marca',
    sub: 'La fuga entra en el 70-95% según el formato',
  },
  {
    value: '45',
    valueNumeric: 45,
    suffix: ' días',
    label: 'Promedio hasta que un activo se convierte en dormido',
    sub: 'Sin alerta, sin acción',
  },
  {
    value: '79',
    valueNumeric: 79,
    label: 'Señales por cliente que el sistema ya calcula',
    sub: 'RFM, frecuencia, sector, idioma, scores',
  },
  {
    value: '500',
    valueNumeric: 500,
    suffix: '+',
    label: 'Restaurantes reales alimentando el modelo',
    sub: 'Argentina · Chile · Uruguay · Brasil · México',
  },
];

export const PROBLEM_PULL_QUOTE =
  'Operan bien. Venden por debajo de su potencial. Tienen miles de clientes y dependen de Instagram para que alguien vuelva.';

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
    trendLabel: '+12% vs mes anterior',
    action: 'Convertir en primera visita con flujo de bienvenida',
    metric: 'Tasa de conversión a cliente',
    sample: {
      name: 'Valentina R.',
      subtitle: 'Consulta por WhatsApp · sin reservas',
      trait: 'Mira el menú los viernes',
    },
  },
  new: {
    volume: 380,
    trend: 'up',
    trendLabel: '+8% vs mes anterior',
    action: 'Traer a la segunda visita antes del día 21',
    metric: 'Tasa de segunda visita',
    sample: {
      name: 'Matías T.',
      subtitle: '1 visita · hace 6 días',
      trait: 'Vino un jueves con su pareja',
    },
  },
  active: {
    volume: 1240,
    trend: 'flat',
    trendLabel: 'Estable',
    action: 'Mantener ritmo, pedir review, profundizar relación',
    metric: 'Frecuencia de visita',
    sample: {
      name: 'Lucía P.',
      subtitle: '9 visitas · última hace 14 días',
      trait: 'Cliente de barra, viernes a la noche',
    },
  },
  at_risk: {
    volume: 620,
    trend: 'down',
    trendLabel: '−6% vs mes anterior',
    action: 'Recuperación preventiva antes que pase a dormido',
    metric: 'Tasa de recuperación',
    sample: {
      name: 'Federico A.',
      subtitle: '4 visitas · última hace 32 días',
      trait: 'Su frecuencia era de 12 días',
    },
  },
  dormant: {
    volume: 4532,
    trend: 'down',
    trendLabel: 'La bolsa más grande',
    action: 'Reactivar con nostalgia y cercanía, sin descuentos',
    metric: 'Revenue recuperado',
    sample: {
      name: 'Juan P.',
      subtitle: '7 visitas · última hace 58 días',
      trait: 'Prefiere jueves noche, sector barra',
    },
  },
  vip: {
    volume: 210,
    trend: 'up',
    trendLabel: '+3% vs mes anterior',
    action: 'Experiencias exclusivas, invitaciones a eventos',
    metric: 'Frecuencia × ticket promedio',
    sample: {
      name: 'María L.',
      subtitle: '18 visitas · ticket promedio $82k',
      trait: 'Reserva para 6 personas los sábados',
    },
  },
};

// §06 — Cómo decide Claude (4 fases)
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
    title: 'Detecta',
    body: 'Nomi analiza continuamente los datos del restaurante y responde una sola pregunta: ¿qué oportunidad de ingreso existe hoy?',
    detail: 'VIP que no viene hace 50 días · 8 mesas vacías para mañana · cluster de primeras visitas que nunca volvieron.',
    accent: '#5b8def',
  },
  {
    kicker: '02',
    title: 'Decide',
    body: 'Cada decisión es explícita: público, objetivo, canal, timing, incentivo y métrica de éxito.',
    detail: 'Selecciona clientes concretos, no segmentos abstractos. Elige WhatsApp o email. Define la ventana de envío.',
    accent: '#0e5e48',
  },
  {
    kicker: '03',
    title: 'Personaliza',
    body: 'Genera mensajes con contexto real del cliente: nombre, historial, preferencia, tono y idioma.',
    detail: 'Nostalgia para reactivación. Celebración para post-visita. Sin descuentos por default — el incentivo es el último recurso.',
    accent: '#e6784c',
  },
  {
    kicker: '04',
    title: 'Ejecuta y aprende',
    body: 'Envía, respeta reglas de frecuencia, trackea la respuesta y atribuye revenue real a cada acción.',
    detail: 'El outcome alimenta las decisiones del mes siguiente. El sistema se ajusta solo.',
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
  guest_language: 'es' | 'pt';
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
    preferred_day: 'jueves',
    preferred_shift: 'noche',
    preferred_sector: 'barra',
    last_score: 4.5,
    lifecycle_state: 'dormant',
    guest_language: 'es',
  },
  message:
    'Hola Juan 👋\nHace un tiempo no te vemos por La Cabrera.\nEsta semana tenemos una mesa en la barra esperándote 😉\n¿Te gustaría venir un jueves?',
  delivery: 'Entregado · leído',
};

// §07 — canal table
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
    note: 'Útil como complemento',
  },
  {
    channel: 'SMS',
    openRate: '70–80%',
    openRateNumeric: 75,
    conversion: '10–20%',
    conversionNumeric: 15,
    note: 'Invasivo y genérico',
  },
  {
    channel: 'WhatsApp',
    openRate: '95–99%',
    openRateNumeric: 97,
    conversion: '45–60%',
    conversionNumeric: 52,
    note: 'Canal nativo de LATAM',
  },
  {
    channel: 'Voice',
    openRate: '60–75%',
    openRateNumeric: 68,
    conversion: '55–70%',
    conversionNumeric: 62,
    note: 'Reactivación VIP · trato humano',
  },
];

// §08 — 5 momentos fundacionales
export interface UseCase {
  rank: string;
  title: string;
  mode: 'Automático' | 'Manual' | 'Automático (activable)' | 'Manual → Automático';
  trigger: string;
  action: string;
  metric: string;
  tileVariant: 'mint' | 'royal' | 'sun' | 'terra' | 'green';
}

export const USE_CASES: UseCase[] = [
  {
    rank: '01',
    title: 'Post-visita inteligente',
    mode: 'Automático',
    trigger: 'El cliente terminó de visitar el restaurante',
    action: 'Flujo adaptativo: agradecimiento → review → invitación a volver',
    metric: 'Tasa de review · segundas visitas · revenue generado',
    tileVariant: 'mint',
  },
  {
    rank: '02',
    title: 'Primera → segunda visita',
    mode: 'Automático',
    trigger: 'Primera visita detectada en los últimos 7 días',
    action: 'Contacto específico enfocado en conversión — incentivo solo si los datos lo justifican',
    metric: 'Tasa de segunda visita · tiempo hasta volver',
    tileVariant: 'royal',
  },
  {
    rank: '03',
    title: 'Reactivación de dormidos',
    mode: 'Automático (activable)',
    trigger: '2+ visitas previas y sin venir hace 45–60 días',
    action: 'Nostalgia + cercanía, un solo canal (WhatsApp), sin descuentos al inicio',
    metric: 'Tasa de reactivación · revenue recuperado',
    tileVariant: 'terra',
  },
  {
    rank: '04',
    title: 'Promocionar evento',
    mode: 'Manual',
    trigger: 'El restaurante selecciona un evento o experiencia',
    action: 'Nomi sugiere la audiencia y escribe el mensaje — se envía',
    metric: 'Reservas generadas · revenue del evento',
    tileVariant: 'sun',
  },
  {
    rank: '05',
    title: 'Llenar mesas en días flojos',
    mode: 'Manual → Automático',
    trigger: 'Patrón de ocupación baja detectado',
    action: 'Invita a clientes que históricamente vienen ese día, o tienen flexibilidad',
    metric: 'Ocupación incremental · revenue incremental',
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
  month: 'Revenue generado este mes',
  lines: [
    {
      label: 'Reactivación de dormidos',
      sent: 312,
      converted: 47,
      revenue: 1880000,
      accent: '#e6784c',
    },
    {
      label: 'Post-visita inteligente',
      sent: 890,
      converted: 28,
      revenue: 470000,
      accent: '#0e5e48',
    },
  ],
};

// §10 — Diferenciación
export interface DiffRow {
  them: string;
  us: string;
}

export const DIFFERENTIATION: DiffRow[] = [
  {
    them: 'Herramientas para enviar mensajes',
    us: 'Sistema que decide qué enviar, a quién y cuándo',
  },
  {
    them: 'Campaign builder manual',
    us: 'Approve, don\u2019t configure',
  },
  {
    them: 'Email + SMS como canales principales',
    us: 'WhatsApp-native con 95%+ open rate en LATAM',
  },
  {
    them: 'Métricas de engagement',
    us: 'Métricas de revenue incremental',
  },
  {
    them: 'Requiere un marketer full-time',
    us: 'Funciona sin marketer',
  },
  {
    them: 'Segmentación manual',
    us: 'Audiencias automáticas por ciclo de vida',
  },
  {
    them: 'Copy genérico',
    us: 'Mensajes personalizados por Nomi',
  },
];

// §11 — 5 mandamientos
export interface Mandamiento {
  rank: string;
  title: string;
  body: string;
}

export const MANDAMIENTOS: Mandamiento[] = [
  {
    rank: '01',
    title: 'Revenue > actividad',
    body: 'Si no mueve ingresos, no importa. Open rate y click rate no son métricas de negocio.',
  },
  {
    rank: '02',
    title: 'Decisiones cerradas',
    body: 'El restaurante aprueba o no. Nada de configuración. Menos opciones, más impacto.',
  },
  {
    rank: '03',
    title: 'Automatización con control',
    body: 'Determinismo primero. IA generativa como soporte, no como cerebro. Todo se puede explicar, apagar y medir.',
  },
  {
    rank: '04',
    title: 'White label total',
    body: 'El restaurante percibe que "el sistema se encarga". No debe sentir que usa una herramienta compleja.',
  },
  {
    rank: '05',
    title: 'Infraestructura como leverage',
    body: 'Todo lo no diferencial se compra o delega. No construimos lo que otro ya resolvió.',
  },
];

// Section headers
export const SECTION_HEADERS = {
  problema: {
    eyebrow: 'El problema',
    title: 'La plata que se está yendo\nmientras nadie mira.',
    lead: 'Los restaurantes tienen miles de clientes registrados pero no recurrencia sistemática. Tienen datos y no hacen nada con ellos. Pierden ingresos por churn silencioso.',
  },
  lifecycle: {
    eyebrow: 'Ciclo de vida',
    title: 'Seis estados.\nSeis acciones concretas.',
    lead: 'Cada cliente vive en un estado operativo — no es analítico, es accionable. Nomi activa la acción correspondiente sin que vos tengas que pensar en segmentos.',
  },
  metodo: {
    eyebrow: 'Cómo decide Nomi',
    title: 'Un cerebro comercial,\nno un chatbot.',
    lead: 'Nomi opera en cuatro fases continuas: detecta, decide, personaliza y ejecuta. Cada decisión es explícita y trackeable.',
  },
  whatsapp: {
    eyebrow: 'Nomi escribe como un dueño',
    title: 'El mensaje no es\ncopy genérico.',
    lead: 'Con el contexto real del cliente, Nomi genera un mensaje que el dueño del restaurante firmaría. Sin descuentos por default, sin tono corporativo, sin urgencia falsa.',
  },
  casos: {
    eyebrow: 'Casos de uso V1',
    title: 'Cinco momentos\nfundacionales.',
    lead: 'Elegidos porque en conjunto cubren todo el ciclo de vida, combinan acciones automáticas y manuales, y generan resultados en el corto plazo.',
  },
  impacto: {
    eyebrow: 'Lo que ves a fin de mes',
    title: 'El único número\nque importa.',
    lead: 'Revenue incremental generado por el sistema. Ingresos que no existirían sin las decisiones de Nomi. No optimizamos nada que no mueva este número.',
  },
  diff: {
    eyebrow: 'Landscape competitivo',
    title: 'Todos ofrecen herramientas.\nNosotros ofrecemos resultado.',
    lead: 'No existe un sistema como este en Latinoamérica. Los competidores globales siguen en el paradigma de "campaign builder" que requiere configuración humana.',
  },
  cta: {
    eyebrow: 'Los cinco mandamientos',
    title: 'Approve,\ndon\u2019t configure.',
    lead: 'No es un CRM. No es un campaign manager. Es un agente de revenue autónomo que convierte datos dispersos en acciones con impacto económico real.',
  },
} as const;
