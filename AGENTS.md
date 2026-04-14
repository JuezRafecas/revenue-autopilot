# AGENTS.md — Revenue Autopilot

Este archivo es la **fuente de verdad** para cualquier agente (Claude Code, Cursor, Aider, Codex, etc.) que entre a este repo. Leelo entero antes de tocar una línea. `CLAUDE.md` es un shim que apunta acá.

---

## 1. Producto — Revenue Autopilot (know-how Woki)

**Qué es.** Sistema autónomo de generación de ingresos para restaurantes. Diagnostica la base de clientes, detecta oportunidades de revenue, y actúa. **El restaurante aprueba, el sistema hace el resto.**

**Usuarios.** Operadores de +500 restaurantes en LatAm (Argentina, Chile, Uruguay, Brasil, México).

**Posicionamiento.** Revenue Autopilot, no un CRM ni un campaign builder. Tagline mental: *Detecta oportunidades de revenue. Decide la acción óptima. Ejecuta a través de canales directos.*

**Modelo mental (tomado de Woki).** Todo flujo sigue esta pipeline:

```
CDP  ───▶  Trigger  ───▶  Audience  ───▶  Workflow  ───▶  Metrics
```

- **CDP**: identidad unificada del guest cruzando reservas, POS, pagos, delivery, walk-ins. ~79 atributos por guest.
- **Trigger**: evento (nueva visita, reserva), schedule (cron), o manual.
- **Audience**: filtro dinámico sobre el CDP o lista estática.
- **Workflow**: árbol de pasos con mensajes, delays, condicionales y branching.
- **Metrics**: entrega + conversión → **revenue incremental atribuido**.

Canales: **WhatsApp primario**, email fallback. Un **Message Governor** aplica reglas de compliance antes de cada envío (frecuencia, opt-in, horario, blackout periods).

**Campañas predefinidas.**
1. Post-visita inteligente (thank-you + review + re-engagement a los 5 días).
2. Conversión 1ª → 2ª visita.
3. Reactivación de dormidos.
4. Promo de eventos / experiencias.
5. Llenar mesas (capacity optimization).

**La única métrica que importa es plata nueva en caja.** No open rates, no CTRs, no "engagement". Si un cambio no mueve revenue atribuido, no va.

### Qué NO hacemos (por diseño)
- No es un CRM.
- No es una herramienta de construcción de campañas.
- No hay segmentación manual (el sistema segmenta).
- No hay configuración compleja (el usuario aprueba, no configura).
- No optimizamos open rates ni clicks.

### Narrativa de demo (60 s)
1. "Los restaurantes tienen miles de clientes que dejaron de venir. No lo saben."
2. Upload de data → diagnóstico instantáneo → "50% de tu base son fantasmas".
3. El sistema detecta la oportunidad y actúa → click en Dormidos → mensajes personalizados.
4. Mostrar mensaje generado → **"Approve, don't configure"**.
5. Revenue tracker → "Tu mismo restaurante, más ingresos en automático".

Todo feature nuevo tiene que sostener esta narrativa. Si no, hay que justificarlo.

---

## 2. Red-Green TDD — disciplina obligatoria

Basado en la guía de Simon Willison: <https://simonwillison.net/guides/agentic-engineering-patterns/red-green-tdd/>.

**La regla.** Antes de implementar cualquier cambio lógico, escribí un test automatizado que falle por la razón correcta. Recién después, implementá lo mínimo para que pase. Recién después, refactorizá.

### Las dos fallas que TDD previene
1. **Código que no funciona.** Si no hay test, no sabés si anda.
2. **Código innecesario.** Si no podés justificar un test para un cambio, el cambio no hace falta.

### Ciclo obligatorio (Red → Green → Repeat)
1. **Red**: escribí el test. Corrélo. **Verificá con tus propios ojos que falla** y que falla por la razón esperada. Un test que pasa en rojo es un test roto y no te protege de nada.
2. **Green**: escribí el mínimo código para que el test pase. Nada más.
3. **Full suite**: corré `npm test` entero, no sólo el test nuevo. Si algo se rompió, arreglalo antes de seguir.
4. **Commit**: un commit por ciclo verde. La suite crece con cada feature y se vuelve la red de seguridad para el resto del hackathon.

### Checklist que pegás al inicio de cada tarea de código
Antes de tocar código productivo, respondé estas cinco preguntas en voz alta:

1. ¿Qué test nuevo cubre este cambio?
2. ¿Lo corrí y **falló por la razón correcta**?
3. ¿Implementé el mínimo código necesario para que pase?
4. ¿Corrí **toda** la suite después?
5. ¿El diff contiene sólo lo que el test exige, sin abstracciones especulativas?

Si cualquiera de estas es "no", frenate y volvé al paso Red.

### Prompt interno para features grandes
> "Antes de tocar `<archivo>`, describí el test que lo cubre, corrélo en rojo confirmando que falla por la razón esperada, y recién después implementá. Al final, corré toda la suite."

### Excepciones acotadas
Cambios puramente visuales (Tailwind classes, copy, spacing, color) que no se pueden testear unitariamente **tienen que verificarse en el dev server en el browser** (golden path + al menos un edge case) antes de marcarse como hechos. No hay excepción para lógica, APIs, cálculos, ni nada en `lib/` o `app/api/`.

---

## 3. Convenciones del repo

**Stack.** Next.js 15 (App Router) · React 19 · TypeScript · Tailwind 3.4 · Supabase (Postgres) · Anthropic Claude SDK · framer-motion · recharts · papaparse.

**Scripts.**
| Comando | Para qué |
|---|---|
| `npm run dev` | Dev server Next.js |
| `npm run build` | Build de producción |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Corre vitest una vez (CI / pre-commit) |
| `npm run test:watch` | vitest en modo watch |
| `npm run seed` | Popula Supabase con el CSV demo |
| `npm run reset` | Trunca todo y re-siembra |
| `npm run generate-csv` | Regenera `data/demo-visits.csv` |

**Archivos donde el hackathon mete mano** (de `HACKATHON_PLAN.md`):
- `lib/segmentation.ts` — `classifyGuests`, `calculateRFM`, `determineSegment` (TODO).
- `lib/revenue.ts` — `calculateRevenueOpportunity`, `buildSegmentSummaries`, `totalRevenueAtStake` (TODO).
- `app/api/analyze/route.ts` — orquestación del diagnóstico.
- `app/api/segments/route.ts` — sacar mock, devolver data real.
- `app/dashboard/page.tsx` — cambiar de mock a data real.
- `app/segments/[segment]/page.tsx` — cambiar de mock a data real.

**Tests viven en** `lib/__tests__/*.test.ts` y `app/api/__tests__/*.test.ts`. Un test nuevo por cada cambio lógico.

**Design system.** Editorial Dark — warm near-black, Fraunces display, Instrument Sans body, JetBrains Mono tabular numerals, hairlines no borders, un solo accent (oxidized copper) para los segmentos que sangran plata. **Prohibido**: glassmorphism, gradientes violetas, aesthetic genérico de SaaS.

---

## 4. Verificación antes de cerrar una tarea

Antes de decir "listo":

1. `npm run typecheck` → limpio.
2. `npm test` → verde, suite entera.
3. Si el cambio toca UI: levantá `npm run dev`, probá el golden path (upload → diagnóstico → segmento → aprobación → revenue) y al menos un edge case.
4. Dejá evidencia en la respuesta al usuario (salida de los comandos, screenshot si aplica). **No hay "listo" sin evidencia.**

Si no podés correr alguno de estos pasos, decilo explícitamente en la respuesta en vez de asumir que pasó.

---

## 5. Qué NO hacer

- **No** agregar abstracciones especulativas ni pensar en "requirements futuros". Tres líneas duplicadas son mejores que un helper prematuro.
- **No** agregar error handling para escenarios que no pueden pasar. Validar en bordes (input de usuario, APIs externas), no adentro.
- **No** mockear Supabase en los tests que tocan `lib/segmentation.ts` o `lib/revenue.ts`. Usá fixtures deterministas o Supabase local. Tests mockeados mienten y se rompen en prod.
- **No** commitear sin que `npm test` esté verde.
- **No** saltearse el Red. "Ya sé que va a andar" es el pensamiento que la guía de Simon identifica como el que rompe el sistema.
- **No** confundir este producto con un campaign builder. Si estás construyendo una UI de configuración, frená y releé la sección 1.

---

## 6. Referencias

- Know-how de producto en vivo: <https://woki-marketing-automation.vercel.app/> y <https://woki-marketing-automation.vercel.app/demo>.
- Guía Red-Green TDD: <https://simonwillison.net/guides/agentic-engineering-patterns/red-green-tdd/>.
- Plan hora-por-hora del hackathon: [`HACKATHON_PLAN.md`](./HACKATHON_PLAN.md).
- Stack y quickstart: [`README.md`](./README.md).
