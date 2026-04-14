# API Spec — Revenue Autopilot

Fuente de verdad de la API HTTP del proyecto. Cada cambio en `app/api/**` actualiza este archivo en el mismo commit.

- **Producto**: Revenue Autopilot para restaurantes. Pipeline: `CDP → Trigger → Audience → Workflow → Metrics`. Ver [`AGENTS.md`](../AGENTS.md) §1.
- **Stack**: Next.js 15 App Router · TypeScript · Supabase (Postgres) · Anthropic Claude SDK.
- **Tipos de dominio**: [`lib/types.ts`](../lib/types.ts). Schema: [`supabase/migrations/001_initial_schema.sql`](../supabase/migrations/001_initial_schema.sql) + [`supabase/migrations/002_campaigns.sql`](../supabase/migrations/002_campaigns.sql).

## Leyenda de estados

| | Significado |
|---|---|
| ✅ | Implementado y conectado a data real |
| 🟡 | Parcial: existe el route, devuelve mock o persistencia incompleta |
| 🔴 | Stub: devuelve `501` o no hace nada útil |
| ➕ | Reservado: no existe todavía, definido como contrato para implementar |

## Convenciones

- Todos los endpoints viven bajo `app/api/**`. Prefijo HTTP: `/api/**`.
- Request/Response: JSON salvo upload (`multipart/form-data`).
- Errores: `{ error: string, code?: string }` con HTTP apropiado — `400` validación, `404` no encontrado, `409` conflicto, `501` stub, `500` server.
- Timestamps: ISO-8601 (`2026-04-14T12:34:56.789Z`).
- IDs: UUID v4.
- Durante el hackathon se asume un único `restaurant_id`, resuelto server-side desde [`lib/constants.ts:DEFAULT_RESTAURANT`](../lib/constants.ts). Multi-tenant real queda fuera de scope.

---

## 1. Data disponible (qué tenemos en los CSVs de La Cabrera)

Antes de diseñar, vale entender qué data cruda tenemos. Los CSVs bajo el root del repo son la fuente del hackathon:

| Archivo | Filas | Rol |
|---|---|---|
| `la_cabrera_cdp_visit.csv` | 18.725 | Fact table de visitas (reservas) |
| `la_cabrera_guest_partner.csv` | 60.280 | Guest agregado por restaurante — fuente principal del `GuestProfile` |
| `la_cabrera_guest_unified.csv` | 56.049 | Guest unificado cross-tenant |

### Visitas (39 columnas)

- **Estados**: `ARRIVED` 14.262 · `CANCELLED_BY_GUEST` 3.534 · `ACCEPTED` 594 · `CANCELLED_BY_VENUE` 199 · `CONFIRMED` 75 · `PENDING_CONFIRMATION` 34 · `EDITED_BY_PARTNER` 18 · `CREATED` 8 · `NO_SHOW` 1.
- **`visit_type`**: 100% `RESERVATION` (sin walk-ins).
- **Canales**: `SHARED_LINK`, `SEARCH_ENGINE`, `QUICK_ADD`, `MARKETPLACE`, `CONSUMER_DIRECT`, `VENUE_STAFF`.
- **Campos útiles**: `visit_id`, `partner_id`, `party_size`, `sector_name`, `channel`, `platform`, `state`, `visited_at`, `has_guarantee`, `guarantee_amount`, `shift_id`, `cancelled_by`, `cancelled_at`, `confirmed_at`, `accepted_at`.
- **Campos vacíos en 100% de la muestra** (ignorar en el mapeo): `score`, `review_*`, `guest_comment`, `venue_comment`, `tags`, `arrived_at`, `departed_at`, `discount_percentage`, `no_show_at`, `rejected_at`.

Mapeo a `visits`:

```text
state=ARRIVED              → outcome='completed'
state=CANCELLED_BY_GUEST   → outcome='cancelled'
state=CANCELLED_BY_VENUE   → outcome='cancelled'
state=NO_SHOW              → outcome='no_show'
state=ACCEPTED|CONFIRMED|PENDING_CONFIRMATION|EDITED_BY_PARTNER|CREATED → outcome='pending'
amount = has_guarantee ? guarantee_amount : null   (fallback: restaurant.avg_ticket a la hora de calcular revenue)
score = null                                       (los prompts toleran null)
```

### Guest × Restaurant (70 columnas)

- **Identidad disponible**: `guest_partner_id`, `guest_name` (sintético: `Guest 51854`), `guest_email` (sintético: `guest51854@demo.com`). **No hay teléfono.**
- **Contadores**: `total_visits`, `total_walkins`, `total_bookings`, `total_pending`, `total_no_shows`, `total_cancellations`, `total_rejected`.
- **Tasas**: `no_show_rate`, `cancellation_rate`, `rejection_rate`, `booking_conversion_rate`, `confirmation_rate`.
- **Insights JSON embebidos**: `guarantee_insights` (única fuente de monetario: `{ totalAmount, totalBookings, bookings[] }`), `cancellation_insights`, `review_insights` (vacío), `channel_insights`, `waitlist_insights` (vacío).
- **Temporal**: `first_visit_at`, `last_visit_at`, `days_since_last`, `total_days_between_visits`, `visit_gap_count`, `next_visit_at`, `days_until_next`.
- **Preferencias**: `preferred_shift`, `preferred_day_of_week`, `preferred_sector`, `preferred_channel`, `preferred_visit_type`, `preferred_platform`.
- **Otros**: `is_favorite`, `is_highlighted`, `is_banned`, `total_lead_time_minutes`, `avg_discount_percentage`, `food_restrictions`, `special_relationship`, `partner_tags`.

Mapeo a `guest_profiles` vía [`lib/cdp.ts:cdpGuestPartnerToProfile`](../lib/cdp.ts).

### Guest unificado cross-tenant (63 columnas)

Mismo guest en varios partners con versiones `_global` de los contadores. En el hackathon lo usamos para **enriquecer** señales de VIP (ej: `total_tenants > 1` como indicador de alto valor cross-brand), no como fuente primaria.

### Qué no tenemos y cómo lo compensamos

| Falta | Impacto | Workaround |
|---|---|---|
| Teléfonos | No hay sendable WhatsApp real | `Guest.phone = null`; canal primario pasa a email o `whatsapp_then_email` sólo para demo |
| Ticket real | No se puede calcular `total_spent` preciso | Usar `guarantee_insights.totalAmount` como approximación, fallback a `restaurant.avg_ticket` |
| Reviews / scores | Los prompts tenían hooks de `score` | Los prompt builders en [`lib/prompts.ts`](../lib/prompts.ts) toleran `null` |

---

## 2. Entidades

Cada entidad mapea 1:1 a una tabla de Supabase y a un type en [`lib/types.ts`](../lib/types.ts). Acá resumo; la referencia completa vive en los archivos linkeados.

### 2.1 `Restaurant`

| Campo | Tipo | Notas |
|---|---|---|
| `id` | uuid | PK |
| `name` | string | |
| `slug` | string | Unique |
| `avg_ticket` | number | ARS. Default `45000` |
| `currency` | string | Default `'ARS'` |
| `timezone` | string | IANA. Default `'America/Argentina/Buenos_Aires'` |

Tabla: `restaurants`.

### 2.2 `Guest`

| Campo | Tipo | Notas |
|---|---|---|
| `id` | uuid | PK |
| `restaurant_id` | uuid | FK → `restaurants` |
| `name` | string | |
| `phone` | string \| null | Casi siempre `null` con la data de La Cabrera |
| `email` | string \| null | |
| `opt_in_whatsapp` | boolean | Default `true` |
| `opt_in_email` | boolean | Default `true` |

Tabla: `guests`.

### 2.3 `Visit`

| Campo | Tipo | Notas |
|---|---|---|
| `id` | uuid | PK |
| `guest_id` | uuid | FK → `guests` |
| `restaurant_id` | uuid | FK → `restaurants` |
| `visit_date` | ISO string | |
| `party_size` | number | |
| `amount` | number \| null | ARS. `null` cuando no hay garantía |
| `shift` | string \| null | `'lunch' \| 'dinner'` |
| `day_of_week` | string \| null | |
| `sector` | string \| null | |
| `visit_type` | string | `'reservation' \| 'walkin'` |
| `outcome` | string | `'completed' \| 'cancelled' \| 'no_show' \| 'pending'` |
| `score` | number \| null | Siempre `null` con La Cabrera |
| `review_comment` | string \| null | Siempre `null` con La Cabrera |

Tabla: `visits`.

### 2.4 `GuestProfile`

Agregado denormalizado con el segmento ya resuelto. Campos core: `total_visits`, `total_no_shows`, `total_cancellations`, `first_visit_at`, `last_visit_at`, `days_since_last`, `avg_days_between_visits`, `avg_party_size`, `avg_amount`, `total_spent`, `avg_score`, `preferred_shift`, `preferred_day_of_week`, `preferred_sector`, `rfm_recency`, `rfm_frequency`, `rfm_monetary`, `rfm_score`, `segment`, `tier`, `calculated_at`.

Tipos derivados:

```ts
type Segment = 'lead' | 'new' | 'active' | 'at_risk' | 'dormant' | 'vip';
type AudienceTier = 'vip' | 'frequent' | 'occasional';
```

Tabla: `guest_profiles`. Constructor principal: [`lib/cdp.ts:cdpGuestPartnerToProfile`](../lib/cdp.ts) + [`lib/segmentation.ts:classifyGuests`](../lib/segmentation.ts) (TODO).

### 2.5 `SegmentSummary`

```ts
interface SegmentSummary {
  segment: Segment;
  count: number;
  percentage: number;        // 0..1
  trend: 'up' | 'down' | 'stable';
  revenue_opportunity: number;
}
```

Derivado de [`lib/revenue.ts:buildSegmentSummaries`](../lib/revenue.ts) (TODO).

### 2.6 `AudienceFilter`

Predicado declarativo en JSON sobre `guest_profiles`. Todos los campos son AND. Empty/undefined = sin filtro.

```ts
interface AudienceFilter {
  segments?: Segment[];
  tiers?: AudienceTier[];
  min_total_visits?: number;
  max_total_visits?: number;
  visited_in_last_days?: number;
  not_visited_in_last_days?: number;
  preferred_day_of_week?: string;
  preferred_shift?: string;
  requires_opt_in?: Channel;
}
```

Matcher: [`lib/audience.ts:matchesAudience`](../lib/audience.ts).

### 2.7 `CampaignTrigger`

Unión discriminada por `type`:

```ts
type CampaignTrigger =
  | { type: 'event'; event: EventType; delay_hours?: number }
  | { type: 'schedule'; at: string }     // ISO o cron
  | { type: 'manual' };

type EventType =
  | 'visit_completed'
  | 'visit_detected'
  | 'no_visit_threshold_reached'
  | 'low_occupancy_detected'
  | 'manual_enrollment';
```

### 2.8 `WorkflowStep`

DAG de pasos. Unión discriminada por `kind`:

```ts
type WorkflowStep =
  | { id: string; kind: 'send_message'; channel: Channel;
      template_id: string; prompt_key: string;
      fallback?: { retry_after_hours: number; retry_channel?: Channel; max_retries: number };
      next?: string }
  | { id: string; kind: 'wait'; hours: number; next?: string }
  | { id: string; kind: 'branch'; condition: 'message_response' | 'visit_since_step' | 'custom';
      branches: Array<{ label: string; matches: string; next: string }> }
  | { id: string; kind: 'end'; outcome: 'completed' | 'escalated' };

type Channel = 'whatsapp' | 'email' | 'whatsapp_then_email';
```

### 2.9 `CampaignTemplate`

Recipe fija. 5 templates canónicos en [`lib/templates.ts`](../lib/templates.ts):

| `key` | Uso |
|---|---|
| `post_visit_smart` | Thank-you + review request + re-engagement |
| `first_to_second_visit` | Convertir 1ª → 2ª visita |
| `reactivate_inactive` | Recuperar dormidos/at_risk |
| `promote_event` | Invitación a eventos para VIPs |
| `fill_empty_tables` | Llenar mesas en día/shift específicos |

```ts
interface CampaignTemplate {
  key: TemplateKey;
  type: 'automation' | 'one_shot';
  name: string;
  description: string;
  headline: string;
  accent: Segment;
  default_audience: AudienceFilter;
  default_trigger: CampaignTrigger;
  workflow: WorkflowStep[];
  kpi_labels: Array<{ label: string; key: string }>;
}
```

Tabla: `campaign_templates`.

### 2.10 `Campaign`

Instancia aprobada por el operador.

```ts
interface Campaign {
  id: string;
  restaurant_id: string;
  template_key: TemplateKey | null;
  type: 'automation' | 'one_shot';
  name: string;
  description: string | null;
  status: 'draft' | 'scheduled' | 'active' | 'paused' | 'completed' | 'archived';
  audience_filter: AudienceFilter;
  trigger: CampaignTrigger;
  workflow: WorkflowStep[];
  channels: Channel[];
  metrics: CampaignMetrics;
  estimated_revenue: number | null;
  created_at: string; updated_at: string;
  started_at: string | null; completed_at: string | null;
}

interface CampaignMetrics {
  sent: number; delivered: number; read: number; responded: number;
  converted: number; failed: number; revenue_attributed: number;
  delivery_rate: number; read_rate: number; response_rate: number; conversion_rate: number;
}
```

Tabla: `campaigns`.

### 2.11 `Message`

Envío individual. State machine:

```text
pending_approval → approved → queued → sent → delivered → read → responded → converted
                                        ↓                                         
                                      failed                                      
                                        ↓                                         
                                     skipped                                      
```

```ts
interface Message {
  id: string;
  restaurant_id: string;
  campaign_id: string | null;
  workflow_step_id: string | null;
  guest_id: string;
  channel: Channel;
  content: string;
  status: MessageStatus;
  response_type: 'positive' | 'negative' | 'no_response' | null;
  response_content: string | null;
  created_at: string;
  approved_at: string | null;
  sent_at: string | null;
  delivered_at: string | null;
  read_at: string | null;
  responded_at: string | null;
  converted_at: string | null;
  failed_at: string | null;
  error_message: string | null;
  estimated_revenue: number | null;
  realized_revenue: number | null;
  guest?: Guest;         // hidratado en reads
  campaign?: Campaign;   // hidratado en reads
}
```

Tabla: `messages`.

### 2.12 `EventRecord`

```ts
interface EventRecord {
  id: string;
  restaurant_id: string;
  event_type: EventType;
  guest_id: string | null;
  visit_id: string | null;
  payload: Record<string, unknown>;
  processed_at: string | null;
  created_at: string;
}
```

Tabla: `events`.

### 2.13 `Attribution`

```ts
interface Attribution {
  id: string;
  restaurant_id: string;
  campaign_id: string;
  message_id: string;
  guest_id: string;
  visit_id: string | null;
  amount: number;
  attribution_window_days: number;   // default 14
  attributed_at: string;
}

interface AttributionSummary {
  campaign_id: string;
  campaign_name: string;
  template_key: TemplateKey | null;
  messages_sent: number;
  conversions: number;
  revenue: number;
  rate: number;
}
```

Tabla: `attributions`. Lógica de matching en [`lib/attribution.ts:shouldAttribute`](../lib/attribution.ts).

### 2.14 `DashboardKPIs`

```ts
interface DashboardKPIs {
  active_campaigns: number;
  messages_sent_30d: number;
  response_rate_30d: number;         // 0..1
  revenue_attributed_30d: number;    // ARS
  revenue_at_stake: number;          // ARS
  total_guests: number;
  base_health_score: number;         // 0..100
}
```

Rollup derivado de `campaigns` + `messages` + `attributions`.

---

## 3. Rutas

### 3.1 Ingest / CDP

#### `POST /api/upload` ✅

Ingesta del CSV legacy (12 columnas) desde el flow de upload de la UI.

- **Request**: `multipart/form-data` con `file` (CSV con columnas `guest_name, phone, email, visit_date, party_size, amount, shift, day_of_week, sector, visit_type, outcome, score`).
- **Response**: `{ success: true; guests: number; visits: number }`
- **Errores**: `400` archivo faltante / CSV inválido · `500` error de DB.
- **Implementación**: [`app/api/upload/route.ts`](../app/api/upload/route.ts). Upserta `restaurants` por slug, dedupea `guests` por `name|phone`, inserta `visits` en batches de 500 usando `getServiceClient()` de [`lib/supabase.ts`](../lib/supabase.ts).

#### `POST /api/cdp/import` ➕ 🔴

Ingesta de los CSVs nativos de Woki (formato La Cabrera). Reemplaza `/api/upload` para el path CDP completo.

- **Request**: `multipart/form-data`
  - `guest_partner_file: File` — obligatorio. Mapea a `guests` + `guest_profiles`.
  - `visit_file?: File` — opcional. Mapea a `visits`.
  - `guest_unified_file?: File` — opcional. Enriquece profiles con señales cross-tenant.
- **Response**:
  ```ts
  { restaurant_id: string; guests: number; profiles: number; visits: number }
  ```
- **Errores**: `400` archivos faltantes o headers inválidos · `500` error de DB.
- **Notas de implementación**:
  1. Parsear con [`lib/cdp.ts:parseCdpGuestPartnerCsv`](../lib/cdp.ts) y `parseCdpVisitCsv`.
  2. Upsertar `restaurants` desde `DEFAULT_RESTAURANT`.
  3. Insertar `guests` (dedupe por `guest_email`), guardando `guest_partner_id` externo para reconciliación.
  4. Llamar [`cdpGuestPartnerToProfile`](../lib/cdp.ts) por row → upsert en `guest_profiles`.
  5. Si viene `visit_file`, mapear estados a `visits.outcome` (ver §1) e insertar en batches.

#### `POST /api/analyze` 🔴

Diagnóstico: lee visits, calcula profiles + segmentos, devuelve summaries. Es el pulso del dashboard.

- **Request**:
  ```ts
  { restaurant_id?: string }   // default: DEFAULT_RESTAURANT
  ```
- **Response**:
  ```ts
  {
    summaries: SegmentSummary[];
    totals: { guests: number; revenue_at_stake: number };
  }
  ```
- **Errores**: `501` hoy · `500` si `classifyGuests` tira.
- **Implementación**: [`app/api/analyze/route.ts`](../app/api/analyze/route.ts). Pendiente:
  1. `supabase.from('visits').select('*').eq('restaurant_id', ...)`.
  2. Agrupar por `guest_id`, llamar [`classifyGuests`](../lib/segmentation.ts).
  3. `upsert` a `guest_profiles`.
  4. Llamar [`buildSegmentSummaries`](../lib/revenue.ts) y [`totalRevenueAtStake`](../lib/revenue.ts).

### 3.2 Audience (lectura del CDP)

#### `GET /api/audience/segments` 🟡

- **Query**: ninguno (futuro: `restaurant_id?`).
- **Response**: `{ summaries: SegmentSummary[] }`
- **Estado**: hoy devuelve `MOCK_SEGMENT_SUMMARIES`. Pendiente: `select count, revenue_opportunity from guest_profiles group by segment`.
- **Implementación**: [`app/api/audience/segments/route.ts`](../app/api/audience/segments/route.ts).

#### `GET /api/audience/guests` 🟡

- **Query**:
  - `segment?: Segment`
  - `tier?: AudienceTier`
  - `limit?: number` (default `50`)
  - `offset?: number` (default `0`)
- **Response**: `{ guests: GuestProfile[]; total: number }` (el `GuestProfile` viene con `guest` hidratado).
- **Estado**: hoy filtra sobre `MOCK_GUESTS`. Pendiente: query real con JOIN `guest_profiles ⟕ guests`.
- **Implementación**: [`app/api/audience/guests/route.ts`](../app/api/audience/guests/route.ts).

#### `GET /api/guests/[id]` ➕ 🔴

Ficha 360 de un guest individual.

- **Path**: `id = guest_id`.
- **Response**:
  ```ts
  {
    guest: Guest;
    profile: GuestProfile | null;
    visits: Visit[];           // ordenadas desc por visit_date
    messages: Message[];       // últimos 20, ordenadas desc por created_at
  }
  ```
- **Errores**: `404` guest no existe.

### 3.3 Templates

#### `GET /api/templates` ✅

- **Response**: `{ templates: CampaignTemplate[] }` en orden fijo (`TEMPLATE_ORDER`).
- **Implementación**: [`app/api/templates/route.ts`](../app/api/templates/route.ts). Sirve `TEMPLATES` de [`lib/templates.ts`](../lib/templates.ts).

### 3.4 Campaigns

#### `GET /api/campaigns` 🟡

- **Query**:
  - `status?: CampaignStatus`
  - `template_key?: TemplateKey`
- **Response**: `{ campaigns: Campaign[] }`
- **Estado**: mock. Pendiente: query real a `campaigns`.
- **Implementación**: [`app/api/campaigns/route.ts`](../app/api/campaigns/route.ts).

#### `POST /api/campaigns` 🟡

Crea una instancia de campaign desde un template.

- **Request**:
  ```ts
  {
    template_key: TemplateKey;
    name?: string;                         // override opcional del name del template
    audience_overrides?: Partial<AudienceFilter>;
    trigger_overrides?: Partial<CampaignTrigger>;
  }
  ```
- **Response**: `{ campaign: Campaign }` (status: `'draft'`).
- **Estado**: devuelve el preview pero no persiste. Pendiente: `insert into campaigns` + `return *`.
- **Notas**: merge shallow con `audience_filter` / `trigger` del template base. Usa [`lib/campaigns.ts:campaignFromTemplate`](../lib/campaigns.ts).

#### `GET /api/campaigns/[id]` 🟡

- **Response**: `{ campaign: Campaign }`
- **Errores**: `404` si no existe.
- **Implementación**: [`app/api/campaigns/[id]/route.ts`](../app/api/campaigns/[id]/route.ts).

#### `PATCH /api/campaigns/[id]` 🔴

- **Request** (whitelist):
  ```ts
  {
    name?: string;
    description?: string | null;
    audience_filter?: AudienceFilter;
    trigger?: CampaignTrigger;
    status?: 'draft' | 'scheduled' | 'active' | 'paused';
  }
  ```
- **Response**: `{ campaign: Campaign }`
- **Errores**: `404` no encontrado · `400` transición de status inválida · `409` conflicto de versión.
- **Notas**: si `status: 'active'` → escribir `started_at = now()`.

#### `DELETE /api/campaigns/[id]` 🔴

Soft delete.

- **Response**: `{ id: string; status: 'archived' }`
- **Errores**: `404` no encontrado.
- **Notas**: update `status='archived'`, `completed_at=now()`. No borra mensajes históricos.

#### `POST /api/campaigns/[id]/run` 🔴

Ejecuta el workflow: materializa audiencia, genera mensajes en `pending_approval`, arranca contadores.

- **Request**:
  ```ts
  { dry_run?: boolean }   // default false
  ```
- **Response**:
  ```ts
  {
    campaign_id: string;
    audience_size: number;
    messages_generated: number;
    dry_run: boolean;
  }
  ```
- **Errores**: `404` · `409` si la campaign ya está `completed` o `archived` · `500` si falla generación de mensajes.
- **Notas de implementación**:
  1. Cargar campaign + template.
  2. Query `guest_profiles` y filtrar con [`filterProfiles`](../lib/audience.ts).
  3. Por cada profile: invocar el step `send_message` inicial del workflow → llamar [`generateMessage`](../lib/claude.ts) con el prompt builder correspondiente (`prompt_key`) → insert `messages` con `status='pending_approval'`.
  4. Si `dry_run=true`: calcular audience_size y tirar rollback.
  5. Update `campaigns.status='active'` + `started_at=now()`.

#### `GET /api/campaigns/[id]/messages` 🟡

- **Query**: `status?: MessageStatus`
- **Response**: `{ campaign_id: string; messages: Message[] }`
- **Estado**: hoy filtra mocks por nombre. Pendiente: query real con JOIN a `guests`.
- **Implementación**: [`app/api/campaigns/[id]/messages/route.ts`](../app/api/campaigns/[id]/messages/route.ts).

### 3.5 Messages

#### `GET /api/messages` 🟡

- **Query**: `status?`, `campaign_id?`, `guest_id?`.
- **Response**: `{ messages: Message[] }` (con `guest` y `campaign` hidratados).
- **Implementación**: [`app/api/messages/route.ts`](../app/api/messages/route.ts).

#### `POST /api/messages/[id]/approve` 🔴

- **Request**: `{}`
- **Response**:
  ```ts
  { id: string; status: 'approved'; approved_at: string; queued: true }
  ```
- **Errores**: `404` · `409` si `status !== 'pending_approval'`.
- **Notas**: update `status='approved'`, `approved_at=now()`, encolar para delivery (hoy: mock en cola en memoria, pendiente: provider real).

#### `POST /api/messages/[id]/reject` ➕ 🔴

- **Request**:
  ```ts
  { reason?: string }
  ```
- **Response**:
  ```ts
  { id: string; status: 'skipped' }
  ```
- **Errores**: `404` · `409` si ya salió del estado `pending_approval`.
- **Notas**: update `status='skipped'`, guardar `reason` en `error_message` para auditoría.

#### `POST /api/messages/[id]/regenerate` ➕ 🔴

Re-genera el contenido de un mensaje antes de aprobarlo.

- **Request**:
  ```ts
  { hint?: string }   // pista opcional para el prompt
  ```
- **Response**:
  ```ts
  { id: string; content: string }
  ```
- **Errores**: `404` · `409` si `status !== 'pending_approval'` · `500` si Claude falla.
- **Notas**: cargar guest + campaign + step, llamar a [`generateMessage`](../lib/claude.ts) con el `prompt_key` del step + `hint` appendeada al user prompt, update `messages.content`.

#### `POST /api/generate-message` ✅

Endpoint standalone para generar un mensaje ad-hoc sin persistir. Sirve al UI de "preview".

- **Request**:
  ```ts
  {
    action_type: 'reactivation' | 'second_visit' | 'fill_tables' | 'post_visit';
    guest: Record<string, unknown>;       // subset del GuestProfile
    fill_tables?: { day: string; shift: string };   // sólo si action_type='fill_tables'
  }
  ```
- **Response**: `{ message: string }`
- **Errores**: `400` validación · `500` si Claude tira (sin API key, rate limit, etc.).
- **Implementación**: [`app/api/generate-message/route.ts`](../app/api/generate-message/route.ts). Wrapper de [`lib/claude.ts`](../lib/claude.ts) + prompt builders de [`lib/prompts.ts`](../lib/prompts.ts).

### 3.6 Events

#### `POST /api/events/trigger` 🟡

Encola un evento que el scheduler/dispatcher debería procesar para disparar automations.

- **Request**:
  ```ts
  {
    event_type: EventType;
    guest_id?: string;
    visit_id?: string;
    payload?: Record<string, unknown>;
  }
  ```
- **Response**:
  ```ts
  { event_type: EventType; queued: true; created_at: string }
  ```
- **Errores**: `400` `event_type` inválido.
- **Estado**: hoy acepta el request pero no persiste. Pendiente: insert en `events` + dispatcher que matchee contra campaigns con `trigger.type='event'`.
- **Implementación**: [`app/api/events/trigger/route.ts`](../app/api/events/trigger/route.ts).

#### `GET /api/events` ➕ 🔴

- **Query**:
  - `processed?: boolean` — `true` para sólo procesados, `false` para pendientes.
  - `event_type?: EventType`
  - `limit?: number` (default `100`)
- **Response**: `{ events: EventRecord[] }`
- **Uso**: debug / timeline en la UI de ops.

### 3.7 Revenue / KPIs

#### `GET /api/revenue/attribution` 🟡

- **Query**:
  - `from?: string` — ISO date.
  - `to?: string` — ISO date.
  - `campaign_id?: string`
- **Response**: `{ rows: AttributionSummary[] }`
- **Estado**: mock. Pendiente: query real con `select campaign_id, count(*), sum(amount) from attributions group by campaign_id`, join a `campaigns` para nombres.
- **Implementación**: [`app/api/revenue/attribution/route.ts`](../app/api/revenue/attribution/route.ts).

#### `GET /api/kpis` 🟡

- **Query**: `range?: '7d' | '30d' | '90d'` (default `'30d'`).
- **Response**: `{ kpis: DashboardKPIs }`
- **Estado**: mock. Pendiente: rollup de `campaigns` + `messages` + `attributions` filtrado por el range.
- **Implementación**: [`app/api/kpis/route.ts`](../app/api/kpis/route.ts).

---

## 4. Pipeline end-to-end

Dónde cae cada endpoint en la pipeline del producto:

```text
┌──────────────── CDP ────────────────┐
│  POST /api/upload           ✅      │   ← legacy CSV
│  POST /api/cdp/import       ➕🔴     │   ← Woki CSV nativo
│  POST /api/analyze          🔴      │   ← corre segmentación
└──────────┬──────────────────────────┘
           ▼
┌────── Audience ─────┐        ┌───── Trigger ─────┐
│  GET  /api/audience │        │ POST /api/events  │
│       /segments   🟡│        │      /trigger   🟡│
│  GET  /api/audience │        │ GET  /api/events  │
│       /guests     🟡│        │                ➕🔴│
│  GET  /api/guests/  │        └─────────┬─────────┘
│       [id]      ➕🔴 │                  │
└──────────┬──────────┘                  │
           └────────────┬─────────────────┘
                        ▼
             ┌──── Campaign/Workflow ────┐
             │ GET   /api/templates    ✅│
             │ GET   /api/campaigns   🟡│
             │ POST  /api/campaigns   🟡│
             │ GET   /api/campaigns/
             │       [id]             🟡│
             │ PATCH /api/campaigns/
             │       [id]             🔴│
             │ DEL   /api/campaigns/
             │       [id]             🔴│
             │ POST  /api/campaigns/
             │       [id]/run         🔴│
             │ GET   /api/campaigns/
             │       [id]/messages    🟡│
             └──────────┬────────────────┘
                        ▼
             ┌───── Messages ─────┐
             │ GET   /api/messages          🟡│
             │ POST  /api/generate-message  ✅│
             │ POST  /api/messages/[id]/
             │       approve                🔴│
             │ POST  /api/messages/[id]/
             │       reject              ➕🔴 │
             │ POST  /api/messages/[id]/
             │       regenerate          ➕🔴 │
             └──────────┬─────────────────────┘
                        ▼
             ┌───── Metrics ─────┐
             │ GET /api/revenue/
             │     attribution 🟡│
             │ GET /api/kpis   🟡│
             └───────────────────┘
```

## 5. Limitaciones conocidas

- **Sin teléfonos reales en la data** → no hay WhatsApp sendable. El canal por default para demo es email, o `whatsapp_then_email` simulado.
- **Sin ticket real** → `total_spent` y `avg_amount` son approximaciones desde `guarantee_insights.totalAmount`.
- **Sin reviews** → los prompts toleran `score: null`. No hay señal de sentiment por guest.
- **Single-tenant durante el hackathon** → `restaurant_id` se resuelve server-side desde `DEFAULT_RESTAURANT`. Multi-tenant real queda fuera.
- **Sin delivery providers** → `sent_at`, `delivered_at`, `read_at` se mockean. No hay webhooks inbound.
- **Sin autenticación** → cualquiera con acceso al dev server puede llamar cualquier endpoint.

## 6. Orden de implementación

Alineado con [`HACKATHON_PLAN.md`](../HACKATHON_PLAN.md):

1. **Segmentación + Revenue** ([`lib/segmentation.ts`](../lib/segmentation.ts), [`lib/revenue.ts`](../lib/revenue.ts)) — prerrequisito de todo.
2. **`POST /api/analyze`** — conecta la UI principal a data real.
3. **`GET /api/audience/segments`** + **`GET /api/audience/guests`** — saca los mocks del dashboard.
4. **`POST /api/cdp/import`** — permite cargar los CSVs de La Cabrera directamente.
5. **`POST /api/campaigns` + `POST /api/campaigns/[id]/run` + `POST /api/messages/[id]/approve`** — ciclo "aprobar y ejecutar" end-to-end.
6. **`GET /api/revenue/attribution` + `GET /api/kpis`** — cierra el tracker de revenue en el dashboard.
7. **Endpoints ➕ (`/api/guests/[id]`, `/api/messages/[id]/reject|regenerate`, `GET /api/events`)** — quality of life si sobra tiempo.

---

**Última actualización**: 2026-04-14. Actualizar este doc en el mismo commit que modifica `app/api/**` o `lib/types.ts`.
