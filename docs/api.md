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

Antes de diseñar, vale entender qué data cruda tenemos. Los CSVs bajo el root del repo son la fuente del hackathon, y se importan **1:1** a las tablas `cdp_*` de la migración [`003_cdp_raw.sql`](../supabase/migrations/003_cdp_raw.sql) sin pérdida de información:

| CSV | Filas | Tabla raw (migración 003) | Rol |
|---|---|---|---|
| `la_cabrera_cdp_visit.csv` | 18.725 | `cdp_visits` (PK `visit_id text`) | Fact table de visitas (reservas) |
| `la_cabrera_guest_partner.csv` | 60.280 | `cdp_guest_partners` (PK `guest_partner_id text`) | Guest × restaurante — espejo del guest_partner |
| `la_cabrera_guest_unified.csv` | 56.049 | `cdp_guest_unified` (PK `guest_id text`) | Guest unificado cross-tenant |

> Las tablas `cdp_*` son de **sólo lectura** después del import. Cualquier mutación (segmentación, campañas, mensajes) vive en el app layer (ver §2.0). El header de `003_cdp_raw.sql` lo dice textual: *"No FKs to app tables: the CDP export does not carry a cdp_visit ↔ cdp_guest_partner link (known gap)."* Ese gap se resuelve por los `visitId` embebidos en los insights de `cdp_guest_partners` — más abajo.

### Visitas (39 columnas)

- **Estados**: `ARRIVED` 14.262 · `CANCELLED_BY_GUEST` 3.534 · `ACCEPTED` 594 · `CANCELLED_BY_VENUE` 199 · `CONFIRMED` 75 · `PENDING_CONFIRMATION` 34 · `EDITED_BY_PARTNER` 18 · `CREATED` 8 · `NO_SHOW` 1.
- **`visit_type`**: 100% `RESERVATION` (sin walk-ins).
- **Canales**: `SHARED_LINK`, `SEARCH_ENGINE`, `QUICK_ADD`, `MARKETPLACE`, `CONSUMER_DIRECT`, `VENUE_STAFF`.
- **Campos útiles**: `visit_id`, `partner_id`, `party_size`, `sector_name`, `channel`, `platform`, `state`, `visited_at`, `has_guarantee`, `guarantee_amount`, `shift_id`, `cancelled_by`, `cancelled_at`, `confirmed_at`, `accepted_at`.
- **Campos vacíos en 100% de la muestra** (ignorar en el mapeo): `score`, `review_*`, `guest_comment`, `venue_comment`, `tags`, `arrived_at`, `departed_at`, `discount_percentage`, `no_show_at`, `rejected_at`.
- **⚠ No hay columna de guest**. El visit CSV no trae `guest_id` ni `guest_partner_id`. El único vínculo visit ↔ guest vive en los JSON embebidos de `guest_partner`:
  - `guarantee_insights.bookings[].visitId`
  - `cancellation_insights.cancellations[].visitId`
  - `review_insights.reviews[].visitId` (vacío en la muestra)

  Cualquier flujo que necesite "las visitas de este guest" tiene que resolverse desde esos arrays, no desde un JOIN directo.

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

Cada entidad mapea a una tabla de Supabase y a un type en [`lib/types.ts`](../lib/types.ts). Acá resumo; la referencia completa vive en los archivos linkeados.

### 2.0 Arquitectura de datos — dos capas

El schema está partido en dos capas con roles distintos:

```text
┌─────────────────────────── RAW CDP layer (migración 003) ───────────────────────────┐
│                                                                                      │
│   cdp_visits          cdp_guest_partners          cdp_guest_unified                  │
│   ┌───────────┐       ┌────────────────────┐       ┌─────────────────┐              │
│   │ visit_id  │       │ guest_partner_id   │       │ guest_id        │              │
│   │  (text PK)│       │  (text PK)         │       │  (text PK)      │              │
│   │ + 38 cols │       │ + 69 cols          │       │ + 62 cols       │              │
│   │ 1:1 CSV   │       │ + guarantee_       │       │ (cross-tenant)  │              │
│   └───────────┘       │   insights jsonb   │       └─────────────────┘              │
│         ▲             │ + cancellation_    │                                          │
│         │             │   insights jsonb   │                                          │
│         │             │ + review_insights  │                                          │
│         │             │ + channel_insights │                                          │
│         │             │ + waitlist_insights│                                          │
│         │             └─────────┬──────────┘                                          │
│         │                       │                                                     │
│         └─────── visitId arrays dentro de los *_insights ──                          │
│                  (único puente cdp_visit ↔ cdp_guest_partner)                        │
└─────────────────────────────────┬────────────────────────────────────────────────────┘
                                  │ proyección (cdpGuestPartnerToProfile)
                                  ▼
┌─────────────────────── APP / domain layer (migraciones 001 + 002) ─────────────────┐
│                                                                                      │
│  restaurants  →  guests  ⟷  guest_profiles   ⟵ acá vive el "guest_partner" a        │
│                    │            │               nivel app (uno por par guest×rest)   │
│                    │            │                                                    │
│                    ▼            ▼                                                    │
│                  visits     campaigns → messages → attributions                      │
│                                │                                                     │
│                                └─ events                                              │
└──────────────────────────────────────────────────────────────────────────────────────┘
```

**Reglas**:
- La capa raw (`cdp_*`) es la **fuente de verdad de los CSVs**. Se toca sólo al importar.
- La capa app es lo que **leen y mutan** la UI, la segmentación, las campañas, los mensajes y la atribución.
- Cada row de `guest_profiles` **es** un guest_partner: uno por cada relación guest × restaurante, con todos los agregados (RFM, segmento, tier, preferencias) materializados. La tabla `guests` existe al lado como contenedor thin de identidad/contacto (`name`, `email`, `phone`, opt-ins).
- El **único puente visit ↔ guest_partner** está en los `visitId` embebidos en los insights de `cdp_guest_partners` (ver §2.5). Cualquier endpoint que pregunte "las visitas de este guest" resuelve por ahí.


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

### 2.2 `Guest` (capa app — identidad/contacto)

Thin. Existe para que `campaigns`, `messages`, `events` y `attributions` tengan una FK estable hacia la identidad del destinatario. **No es la unidad de segmentación ni de acciones** — eso vive en `guest_profiles` (§2.4). Hay exactamente un `guests` row por cada `guest_profiles` row.

| Campo | Tipo | Notas |
|---|---|---|
| `id` | uuid | PK |
| `restaurant_id` | uuid | FK → `restaurants`. Un `guests` row representa "guest × restaurante" — si la misma persona aparece en dos restaurantes, son dos rows |
| `name` | text | |
| `phone` | text \| null | Casi siempre `null` con la data de La Cabrera |
| `email` | text \| null | |
| `opt_in_whatsapp` | boolean | Default `true` |
| `opt_in_email` | boolean | Default `true` |
| `created_at` | timestamptz | |

Tabla: `guests`. Definida en [`001_initial_schema.sql`](../supabase/migrations/001_initial_schema.sql) + extendida con opt-ins en [`002_campaigns.sql`](../supabase/migrations/002_campaigns.sql).

### 2.3 `Visit` (capa app)

Fact table del dominio. La raw (`cdp_visits`) tiene 39 columnas; la app-layer `visits` se queda con un subset manejable para segmentación + atribución. Se puede hidratar desde `cdp_visits` al proyectar, o consultar `cdp_visits` directo para analytics que necesiten los campos completos.

| Campo | Tipo | Notas |
|---|---|---|
| `id` | uuid | PK |
| `guest_id` | uuid | FK → `guests` (nullable si no hay match vía insights — el CDP no linkea directo) |
| `restaurant_id` | uuid | FK → `restaurants` |
| `visit_date` | timestamptz | `visited_at` del CSV raw |
| `party_size` | int | |
| `amount` | decimal(10,2) | ARS. `null` cuando no hay garantía |
| `shift` | text | `'lunch' \| 'dinner'` |
| `day_of_week` | text | Derivado |
| `sector` | text | `sector_name` |
| `visit_type` | text | `'reservation' \| 'walkin'` |
| `outcome` | text | `'completed' \| 'cancelled' \| 'no_show' \| 'pending'` (derivado del `state` del CDP) |
| `score` | decimal(3,1) | Siempre `null` con La Cabrera |
| `review_comment` | text | Siempre `null` con La Cabrera |
| `created_at` | timestamptz | |

Tabla: `visits` (migración 001). La "copia canónica" de cada fila vive también en `cdp_visits.visit_id` (el hash), para poder resolver los `visitId` embebidos en los insights.

### 2.4 `GuestProfile` — **el guest_partner a nivel app**

Un row en `guest_profiles` es la unidad operativa del producto: un guest × un restaurante, con todos los agregados materializados, el segmento asignado y el tier calculado. La UI de segmentos, las audiencias de las campañas, la generación de mensajes y la atribución trabajan contra esta tabla.

Relación 1:1 con `guests` vía `guest_profiles.guest_id unique references guests(id)`. Para obtener "el guest_partner N" hay que leer el par `guest_profiles ⟕ guests` por `guest_id`.

```ts
interface GuestProfile {
  id: string;                        // uuid
  guest_id: string;                  // uuid, FK → guests, unique
  restaurant_id: string;             // uuid, FK → restaurants
  total_visits: number;
  total_no_shows: number;
  total_cancellations: number;
  first_visit_at: string | null;
  last_visit_at: string | null;
  days_since_last: number | null;
  avg_days_between_visits: number | null;
  avg_party_size: number | null;
  avg_amount: number | null;
  total_spent: number | null;
  avg_score: number | null;
  preferred_shift: string | null;
  preferred_day_of_week: string | null;
  preferred_sector: string | null;
  rfm_recency: number | null;
  rfm_frequency: number | null;
  rfm_monetary: number | null;
  rfm_score: string | null;
  segment: Segment;                  // 'lead' | 'new' | 'active' | 'at_risk' | 'dormant' | 'vip'
  tier: AudienceTier;                // 'vip' | 'frequent' | 'occasional'
  calculated_at: string;
  guest?: Guest;                     // hidratado en reads
}
```

Tabla: `guest_profiles` (migraciones [`001`](../supabase/migrations/001_initial_schema.sql) + [`002`](../supabase/migrations/002_campaigns.sql) que agrega `tier`). **No tiene columnas JSONB de insights** — esos siguen en `cdp_guest_partners` (§2.5) y se joinean cuando hace falta.

**Constructor principal**: [`lib/cdp.ts:cdpGuestPartnerToProfile`](../lib/cdp.ts) proyecta `cdp_guest_partners` → `GuestProfile` (rename casi directo, más cálculos derivados `avg_amount`, `avg_days_between_visits`, `avg_score`). Los campos `rfm_*`, `segment` y `tier` quedan como placeholder y los asigna [`lib/segmentation.ts:classifyGuests`](../lib/segmentation.ts) (TODO).

### 2.5 Raw CDP tables (`cdp_*`) — espejo de los CSVs

Las tres tablas de la migración [`003_cdp_raw.sql`](../supabase/migrations/003_cdp_raw.sql) preservan los CSVs sin pérdida. Son la fuente de verdad para cualquier dato que no esté materializado en el app layer — especialmente los insights JSON que son el único puente visit ↔ guest_partner.

#### `cdp_visits`

| Columna | Tipo | Notas |
|---|---|---|
| `visit_id` | text PK | Hash del CDP, ej. `69b03705dc7dc47bd1858838`. Es el string que aparece en los `visitId` de los insights — **por eso es el PK**. |
| `tenant`, `partner_id`, `visit_type`, `party_size`, `party_size_seated`, `sector_name`, `channel`, `platform`, `state`, `visit_outcome` | | Core de la reserva |
| `guest_comment`, `venue_comment`, `tags` (jsonb) | | Vacíos en La Cabrera |
| `arrived_at`, `departed_at`, `visited_at`, `confirmed_at`, `accepted_at`, `no_show_at`, `rejected_at`, `cancelled_at` | timestamptz | Timeline |
| `score`, `review_*` (×11) | | Ratings — todos vacíos en La Cabrera |
| `discount_percentage`, `has_guarantee`, `guarantee_amount`, `cancelled_by`, `shift_id`, `source_state` | | Extras |

Indexes: `visited_at`, `partner_id`, `state`, `visit_outcome`.

**No hay FK a `cdp_guest_partners`.** El link sólo existe por los `visitId` embebidos en los insights JSON del guest_partner (ver siguiente tabla).

#### `cdp_guest_partners`

| Columna | Tipo | Notas |
|---|---|---|
| `guest_partner_id` | text PK | Hash del CDP, ej. `CC5AB85BC1790384FA650EF5306B3414` |
| `tenant`, `partner_id`, `brand_id` | text | Tenant |
| `guest_name`, `guest_email`, `guest_language` | text | Identidad |
| `location_name`, `location_categories` (jsonb), `location_city` | | Venue |
| `total_visits`, `total_walkins`, `total_bookings`, `total_pending`, `total_no_shows`, `total_cancellations`, `total_rejected` | int | Contadores |
| `no_show_rate`, `cancellation_rate`, `rejection_rate`, `booking_conversion_rate`, `confirmation_rate` | numeric | Tasas |
| `guarantee_insights` | jsonb | `{ lastAt, bookings: [{ date, amount, visitId }], totalAmount, totalBookings }` — **la única fuente de monetario y el primer lugar donde vive el puente visit→guest** |
| `cancellation_insights` | jsonb | `{ lastAt, lastBy, cancellations: [{ by, date, reason, visitId }], cancelledByGuest, cancelledByVenue, totalCancellations }` — segundo puente |
| `review_insights` | jsonb | `{ reviews: [{ visitId, ... }], totalRating, totalReviews, ... }` — vacío en la muestra pero estructuralmente existe |
| `channel_insights` | jsonb | `{ channelMigrated, directBookingRate, lastBookingChannel, firstBookingChannel, preferredBookingChannel }` |
| `waitlist_insights` | jsonb | Vacío en la muestra |
| `first_visit_at`, `last_visit_at`, `days_since_last`, `next_visit_at`, `days_until_next`, `total_days_between_visits`, `visit_gap_count` | | Temporal |
| `preferred_shift`, `preferred_day_of_week`, `preferred_sector`, `preferred_channel`, `preferred_visit_type`, `preferred_platform` | text | Preferencias |
| `is_favorite`, `is_highlighted`, `is_banned`, `food_restrictions`, `special_relationship`, `partner_tags` (jsonb) | | Flags |
| `total_score`, `scored_visit_count`, `last_score`, `last_scored_at`, `last_review_rating` | | Ratings agregados |
| `total_party_size`, `party_size_count`, `total_seated_guests`, `seated_visit_count`, `total_guests_brought` | | Party size |
| `avg_discount_percentage`, `total_discounted_visits`, `total_venue_notes`, `total_lead_time_minutes`, `last_lead_time_minutes`, `direct_booking_rate`, `direct_booking_count` | | Extras |
| `first_booking_channel`, `last_booking_channel`, `calculated_at`, `source` | | Metadata |

Indexes: `total_visits`, `days_since_last`, `last_visit_at`, `guest_email`.

TS correspondiente: [`CdpGuestPartnerRow` en `lib/cdp.ts`](../lib/cdp.ts). Forma de los insights:

```ts
interface GuaranteeInsights {
  lastAt: string | null;
  bookings: Array<{ date: string; amount: number; visitId: string }>;
  totalAmount: number;
  totalBookings: number;
}

interface CancellationInsights {
  lastAt: string | null;
  lastBy: 'GUEST' | 'VENUE' | null;
  cancellations: Array<{ by: 'GUEST' | 'VENUE'; date: string; reason: string; visitId: string }>;
  cancelledByGuest: number;
  cancelledByVenue: number;
  totalCancellations: number;
}

interface ReviewInsights {
  reviews: Array<{ visitId?: string; /* ... */ }>;
  totalRating: number;
  totalReviews: number;
  // food/service/ambience rating counts + totals
}

interface ChannelInsights {
  channelMigrated: boolean;
  directBookingRate: number;
  lastBookingChannel: string | null;
  firstBookingChannel: string | null;
  preferredBookingChannel: string | null;
}
```

Los `visitId` dentro de `guarantee_insights.bookings[]`, `cancellation_insights.cancellations[]` y `review_insights.reviews[]` coinciden con `cdp_visits.visit_id`. Eso habilita el resolver de `GET /api/guest-partners/[id]/visits` (§3.2).

#### `cdp_guest_unified`

Cross-brand. PK `guest_id text`. Tiene versiones `_global` de los contadores (`total_visits_global`, `total_no_shows_global`, etc.), `favorite_partner_id`, `visited_cities` (jsonb), `cuisine_preferences` (jsonb), y los mismos insights JSON que `cdp_guest_partners` pero agregados cross-tenant. Indexes: `primary_email`, `last_seen_at`.

**Uso en el MVP**: sólo lectura para enriquecer señales de VIP (ej. `total_tenants > 1` = alto valor cross-brand). No se proyecta al app layer.

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

Ingesta de los CSVs nativos del CDP (formato La Cabrera). Flujo de dos pasos: **raw insert** (llena `cdp_*`) + **proyección** (materializa `guests` + `guest_profiles` + `visits` a partir del raw).

- **Request**: `multipart/form-data`
  - `guest_partner_file: File` — obligatorio. Destino raw: `cdp_guest_partners`.
  - `visit_file?: File` — opcional. Destino raw: `cdp_visits`.
  - `guest_unified_file?: File` — opcional. Destino raw: `cdp_guest_unified`.
- **Response**:
  ```ts
  {
    restaurant_id: string;
    raw: {
      cdp_guest_partners: number;
      cdp_visits: number;
      cdp_guest_unified: number;
    };
    projected: {
      guests: number;
      guest_profiles: number;
      visits: number;
    };
  }
  ```
- **Errores**: `400` archivos faltantes o headers inválidos · `500` error de DB.
- **Notas de implementación**:

  **Paso 1 — Raw insert** (preserva el CSV 1:1):
  1. Parsear con [`parseCdpGuestPartnerCsv`](../lib/cdp.ts) / [`parseCdpVisitCsv`](../lib/cdp.ts) / [`parseCdpGuestUnifiedCsv`](../lib/cdp.ts).
  2. Upsert en `cdp_guest_partners`, `cdp_visits`, `cdp_guest_unified` por su PK text. Idempotente: re-ejecutar pisa el estado anterior.
  3. Upsert `restaurants` desde `DEFAULT_RESTAURANT`.

  **Paso 2 — Proyección al app layer**:
  4. Por cada row en `cdp_guest_partners`:
     - Insertar un `guests` row (`name = guest_name`, `email = guest_email`, `phone = null`, `restaurant_id = <resolved>`). El `guests.id` se genera como uuid nuevo.
     - Llamar [`cdpGuestPartnerToProfile(row, restaurantId)`](../lib/cdp.ts) y upsertear el resultado en `guest_profiles` (con `guest_id` apuntando al uuid del paso anterior).
  5. **Construir el reverse-index** `Map<cdp_visit_id, guest_uuid>` recorriendo los insights del raw:
     ```ts
     const index = new Map<string, string>();
     for (const gp of cdpGuestPartners) {
       const g = guestIdByPartnerId.get(gp.guest_partner_id)!;
       for (const b of gp.guarantee_insights?.bookings ?? []) index.set(b.visitId, g);
       for (const c of gp.cancellation_insights?.cancellations ?? []) index.set(c.visitId, g);
       for (const r of gp.review_insights?.reviews ?? []) {
         if (typeof r.visitId === 'string') index.set(r.visitId, g);
       }
     }
     ```
  6. Proyectar `cdp_visits` → `visits`: por cada row mapear estados (`ARRIVED→completed`, `CANCELLED_BY_*→cancelled`, `NO_SHOW→no_show`, resto → `pending`), `amount = has_guarantee ? guarantee_amount : null`, `visit_date = visited_at`, `guest_id = index.get(cdp_visit.visit_id) ?? null`. Insertar en batches de 500.
  7. Visits sin match en el index quedan con `guest_id = null` — esperable para cualquier visit cuyo `visitId` no aparezca en los insights. No rompe nada.
  8. Los insights JSON **no se duplican** en el app layer: viven sólo en `cdp_guest_partners`. Cualquier endpoint que los necesite joinea por `guest_partner_id` o `guest_email`.

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

Lista de GuestPartners filtrable por segmento/tier.

- **Query**:
  - `segment?: Segment`
  - `tier?: AudienceTier`
  - `limit?: number` (default `50`)
  - `offset?: number` (default `0`)
- **Response**: `{ guests: GuestProfile[]; total: number }` (cada `GuestProfile` trae el `guest` — léase GuestPartner — hidratado).
- **Estado**: hoy filtra sobre `MOCK_GUESTS`. Pendiente: query real con JOIN `guest_profiles ⟕ guests`.
- **Implementación**: [`app/api/audience/guests/route.ts`](../app/api/audience/guests/route.ts).

#### `GET /api/guest-partners/[id]` ➕ 🔴

Ficha 360 del guest_partner (un row en `guest_profiles` + contacto).

- **Path**: `id` puede ser:
  - `guest_profiles.id` (uuid del app layer), **o**
  - `cdp_guest_partners.guest_partner_id` (hash text del CDP — reconciliado server-side buscando el row en `cdp_guest_partners` y luego el `guest_profiles` con el mismo `guest_email`).
  
  El handler decide por heurística de formato (uuid vs hex hash).
- **Response**:
  ```ts
  {
    guest_partner: {
      profile: GuestProfile;          // guest_profiles row
      guest: Guest;                   // hidratado de guests por guest_id
      raw?: CdpGuestPartnerRow;       // opcional: row crudo de cdp_guest_partners (incluye los *_insights jsonb)
    };
    messages: Message[];              // últimos 20 contra este guest_id
  }
  ```
- **Query**:
  - `include_raw?: boolean` (default `false`) — si true, joinea con `cdp_guest_partners` y devuelve la row completa en `guest_partner.raw`.
- **Errores**: `404` guest_partner no existe.
- **Notas**: no incluye visits. Para eso → endpoint siguiente.

#### `GET /api/guest-partners/[id]/visits` ➕ 🔴

Resuelve las visitas asociadas a un guest_partner leyendo los `visitId` embebidos en los insights JSON de `cdp_guest_partners` y joineando contra `cdp_visits` por `visit_id`. Este endpoint es la **única** forma correcta de obtener "las visitas de un guest" en este producto (el CDP no trae un link directo visit → guest_partner).

- **Path**: `id` = `guest_profiles.id` o `cdp_guest_partners.guest_partner_id`.
- **Query**:
  - `source?: 'bookings' | 'cancellations' | 'reviews' | 'all'` (default `'all'`) — filtrar por qué insight originó el link.
  - `limit?: number` (default `200`)
- **Response**:
  ```ts
  {
    guest_partner_id: string;          // el hash del CDP
    visits: Array<CdpVisitRow & { linked_via: 'bookings' | 'cancellations' | 'reviews' }>;
    total: number;
    unresolved_ids: string[];          // visitIds del insight que no matchean ninguna fila en cdp_visits
  }
  ```
  El payload devuelve filas de `cdp_visits` directamente (39 columnas, full fidelity). Si el consumer quiere sólo los campos "de dominio", puede proyectarlos client-side con el mapeo de §1.
- **Errores**: `404` guest_partner no existe.
- **Notas de implementación**:
  1. Resolver el `guest_partner_id` (hash text) desde el path. Si llegó un uuid, hacer `guest_profiles → guests.email → cdp_guest_partners.guest_email` (o mantener un índice a parte si la búsqueda es lenta).
  2. `select guarantee_insights, cancellation_insights, review_insights from cdp_guest_partners where guest_partner_id = ?`.
  3. Extraer los `visitId` de:
     - `guarantee_insights.bookings[].visitId`
     - `cancellation_insights.cancellations[].visitId`
     - `review_insights.reviews[].visitId` (puede no tenerlo)
     
     Marcar cada uno con `linked_via` según de qué array salió. Dedupe final: si un `visitId` aparece en varios arrays, priorizar `bookings > cancellations > reviews`.
  4. Filtrar por `source` si viene en query.
  5. `select * from cdp_visits where visit_id in (...)` con el batch de IDs resueltos.
  6. Ordenar por `visited_at` desc, aplicar `limit`.
  7. `unresolved_ids` = los que no encontraron fila (puede pasar si el import del `visit_file` fue parcial o si la visit es previa al rango del CSV de visits).

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
┌────── Audience ─────────────┐   ┌───── Trigger ─────┐
│  GET  /api/audience         │   │ POST /api/events  │
│       /segments           🟡│   │      /trigger   🟡│
│  GET  /api/audience         │   │ GET  /api/events  │
│       /guests             🟡│   │                ➕🔴│
│  GET  /api/guest-partners/  │   └─────────┬─────────┘
│       [id]              ➕🔴 │             │
│  GET  /api/guest-partners/  │             │
│       [id]/visits       ➕🔴 │             │
└──────────┬──────────────────┘             │
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

- **Gap cdp_visit ↔ cdp_guest_partner** → el CDP no trae una FK directa. El único puente son los `visitId` embebidos en `guarantee_insights`, `cancellation_insights` y `review_insights` de `cdp_guest_partners`. Cualquier visit que no esté en ninguno de esos arrays no se puede atribuir a un guest_partner. El `GET /api/guest-partners/[id]/visits` y la proyección de `/api/cdp/import` son los dos lugares donde esto se maneja explícitamente.
- **Sin teléfonos reales en la data** → no hay WhatsApp sendable. El canal por default para demo es email, o `whatsapp_then_email` simulado.
- **Sin ticket real** → `total_spent` y `avg_amount` son approximaciones desde `guarantee_insights.totalAmount`.
- **Sin reviews ni scores** → todos los campos `score`, `review_*` del CDP vienen vacíos en la muestra. Los prompts toleran `score: null`. No hay señal de sentiment por guest.
- **Single-tenant durante el hackathon** → `restaurant_id` se resuelve server-side desde `DEFAULT_RESTAURANT`. Multi-tenant real queda fuera.
- **Sin delivery providers** → `sent_at`, `delivered_at`, `read_at` se mockean. No hay webhooks inbound.
- **Sin autenticación** → cualquiera con acceso al dev server puede llamar cualquier endpoint.
- **`cdp_guest_unified` no se proyecta** → vive sólo en el raw layer. Si hace falta enriquecer (ej. detectar VIP cross-tenant), se joinea on-demand por `guest_email`.

## 6. Orden de implementación

Alineado con [`HACKATHON_PLAN.md`](../HACKATHON_PLAN.md):

1. **Segmentación + Revenue** ([`lib/segmentation.ts`](../lib/segmentation.ts), [`lib/revenue.ts`](../lib/revenue.ts)) — prerrequisito de todo.
2. **`POST /api/analyze`** — conecta la UI principal a data real.
3. **`GET /api/audience/segments`** + **`GET /api/audience/guests`** — saca los mocks del dashboard.
4. **`POST /api/cdp/import`** — permite cargar los CSVs de La Cabrera directamente.
5. **`POST /api/campaigns` + `POST /api/campaigns/[id]/run` + `POST /api/messages/[id]/approve`** — ciclo "aprobar y ejecutar" end-to-end.
6. **`GET /api/revenue/attribution` + `GET /api/kpis`** — cierra el tracker de revenue en el dashboard.
7. **Endpoints ➕ (`/api/guest-partners/[id]`, `/api/guest-partners/[id]/visits`, `/api/messages/[id]/reject|regenerate`, `GET /api/events`)** — quality of life si sobra tiempo. El `/visits` es el que resuelve las visitas de un guest vía los `visitId` de los insights.

---

**Última actualización**: 2026-04-14. Actualizar este doc en el mismo commit que modifica `app/api/**` o `lib/types.ts`.
