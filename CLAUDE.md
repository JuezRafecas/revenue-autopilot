# CLAUDE.md

**Leé [`AGENTS.md`](./AGENTS.md) antes de cualquier cosa.** Es la fuente de verdad para producto, disciplina TDD y convenciones del repo. Este archivo sólo agrega anclas específicas de Claude Code.

## TL;DR del producto
Revenue Autopilot para restaurantes. **Approve, don't configure.** La única métrica que importa es plata nueva en caja. Pipeline: CDP → Trigger → Audience → Workflow → Metrics. No es un CRM, no es un campaign builder. Know-how en vivo: <https://woki-marketing-automation.vercel.app/demo>.

## Disciplina no negociable — Red-Green TDD
Basado en <https://simonwillison.net/guides/agentic-engineering-patterns/red-green-tdd/>.

1. **Red**: escribí el test primero, corrélo, **verificá que falla por la razón correcta**. Un test que pasa en rojo no protege nada.
2. **Green**: el mínimo código para que pase.
3. **Full suite**: `npm test` entero después de cada ciclo.
4. **Verificación antes de cerrar**: `npm run typecheck` + `npm test` verdes. Para UI, levantar `npm run dev` y probar el golden path en el browser. Sin evidencia no hay "listo".

Excepción acotada: cambios puramente visuales (Tailwind, copy, spacing) se verifican en el browser. Todo lo demás pasa por Red-Green.

## Skills de Claude Code a usar
- **`superpowers:test-driven-development`** — obligatoria antes de implementar cualquier feature o bugfix en `lib/`, `app/api/`, o cualquier lógica.
- **`superpowers:brainstorming`** — antes de trabajo creativo (nueva feature, nuevo componente, cambio de comportamiento).
- **`superpowers:verification-before-completion`** — antes de declarar una tarea terminada.
- **`Explore` subagent** — para búsquedas que necesitan más de 3 queries sobre el codebase.

## Archivos donde el hackathon mete mano
`lib/segmentation.ts`, `lib/revenue.ts`, `app/api/analyze/route.ts`, `app/api/segments/route.ts`, `app/dashboard/page.tsx`, `app/segments/[segment]/page.tsx`. Ver [`HACKATHON_PLAN.md`](./HACKATHON_PLAN.md) para el orden y [`AGENTS.md`](./AGENTS.md) §3 para las convenciones.
