# Plan de Ejecución — Hackathon

## Contexto del producto
Un sistema autónomo de generación de ingresos para restaurantes.
Diagnostica la base de clientes, detecta oportunidades de revenue, y actúa.
"El restaurante aprueba, el sistema hace el resto."

## Milestones por hora

### Hora 0-1: Setup y verificación
- [ ] Clonar repo, instalar deps, verificar que el dev server corra
- [ ] Verificar conexión a Supabase (tablas ya deben existir)
- [ ] Correr `npm run seed` — verificar que la data demo cargue
- [ ] Verificar que Claude API responda (probar endpoint /api/generate-message)

### Hora 1-3: Motor de segmentación (CORE)
- [ ] Implementar `classifyGuests()` en `lib/segmentation.ts`
- [ ] Implementar `calculateRFM()`
- [ ] Implementar el endpoint `/api/analyze` que lee visits, calcula profiles, inserta en guest_profiles
- [ ] Implementar `/api/segments` que devuelve el resumen por segmento real (no mock)
- [ ] Probar: subir CSV → analizar → ver segmentos reales en la UI

### Hora 3-5: Dashboard con data real
- [ ] Cambiar `app/dashboard/page.tsx` para leer de `/api/segments` en vez de `MOCK_SEGMENT_SUMMARIES`
- [ ] Conectar `HealthScore` con data real
- [ ] Implementar `calculateRevenueOpportunity()` en `lib/revenue.ts`
- [ ] Verificar que la pantalla principal se vea impactante con data real

### Hora 5-7: Acciones y mensajes AI
- [ ] Conectar `/segments/[segment]` con data real de guests por segmento
- [ ] Implementar "Activar reactivación": botón que genera mensajes para los top N guests dormidos usando `/api/generate-message`
- [ ] Conectar `ActionPanel` con `/api/actions` para persistir aprobaciones
- [ ] Implementar "Llenar mesas": form → `/api/fill-tables` → matches → generar mensajes

### Hora 7-9: Revenue tracker + perfil de guest
- [ ] Conectar `/revenue` con acciones reales desde la DB
- [ ] Conectar `/guest/[id]` con visits reales del guest
- [ ] Conectar todo el flow end-to-end

### Hora 9-11: Polish + demo
- [ ] Pulir transiciones y loading states
- [ ] Asegurar que el flow completo (upload → diagnóstico → acción → aprobación → revenue) funcione en <60 segundos
- [ ] Preparar dataset demo si es necesario ajustar números
- [ ] Preparar pantalla final de "Revenue Report"

### Hora 11-12: Pitch
- [ ] Practicar demo 3 veces
- [ ] Preparar fallbacks (si Claude API falla, tener mensajes pre-generados)
- [ ] Screenshot/video de backup por si algo se rompe en vivo

## Narrativa de la demo (60 segundos)
1. "Los restaurantes tienen miles de clientes que dejaron de venir. No lo saben."
2. Mostrar upload de data → diagnóstico instantáneo → "50% de tu base son fantasmas"
3. "El sistema detecta la oportunidad y actúa" → click en Dormidos → mensajes personalizados
4. Mostrar un mensaje generado → "Approve, don't configure"
5. Revenue tracker → "Tu mismo restaurante, más ingresos en automático"

## Lo que NO hacemos (por diseño)
- No es un CRM
- No es una herramienta de campañas
- No hay segmentación manual
- No hay configuración compleja
- No optimizamos open rates ni clicks
- La única métrica es plata nueva en caja

## Archivos clave donde vas a meter mano
- `lib/segmentation.ts` — motor de clasificación (TODO)
- `lib/revenue.ts` — cálculos de oportunidad (TODO)
- `app/api/analyze/route.ts` — orquestación del diagnóstico
- `app/api/segments/route.ts` — devolver segmentos reales (sacar mock)
- `app/dashboard/page.tsx` — cambiar de mock a data real
- `app/segments/[segment]/page.tsx` — cambiar de mock a data real
