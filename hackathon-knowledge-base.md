# Revenue Autopilot — Hackathon Knowledge Base

> El sistema que se encarga de que los clientes vuelvan al restaurante, sin que el restaurante tenga que hacer marketing.

---

## 1. Qué estamos construyendo

Estamos construyendo un **agente de revenue autónomo para restaurantes**. Un sistema donde una IA (Claude) actúa como el CMO del restaurante: analiza datos de clientes, detecta oportunidades de ingreso, decide qué hacer, personaliza cada mensaje, y ejecuta — todo sin que el restaurante tenga que pensar en marketing.

El restaurante no configura campañas. No elige segmentos. No escribe mensajes. El sistema decide, propone, y el restaurante solo aprueba. Si no aprueba, el sistema aprende y ajusta.

**La frase que define todo:** "Approve, don't configure."

### Qué NO es esto

No es un CRM. No es un campaign manager. No es una herramienta de marketing automation tradicional. No es un chatbot. No es un CDP que se vende al restaurante.

Es un **cerebro comercial autónomo** que convierte datos dispersos en acciones con impacto económico real.

### El insight central

El valor no está en enviar mensajes. El valor está en saber **a quién, cuándo y por qué accionar**. El mensaje es consecuencia de una buena decisión, no al revés.

---

## 2. El problema

Los restaurantes:

- Operan bien, pero venden por debajo de su potencial
- Tienen miles de clientes registrados pero no recurrencia sistemática
- Tienen datos (visitas, frecuencia, horarios, no-shows) pero no hacen nada con ellos
- Pierden ingresos por capacidad ociosa y churn silencioso
- Dependen de Instagram como único medio de comunicación

El marketing tradicional no escala para ellos: requiere tiempo, requiere conocimiento, genera fricción operativa. La mayoría ni siquiera lo intenta.

**Mientras en ecommerce existen sistemas sofisticados de recuperación de carrito, retargeting y automation, en gastronomía estas herramientas prácticamente no existen.** Esto crea una oportunidad enorme.

### El cambio mental clave

El restaurante **no quiere** datos, segmentos, dashboards ni workflows.

El restaurante **sí quiere** mesas llenas martes y miércoles, que vuelvan los clientes que dejaron de venir, no parecer spammer, y no pensar en marketing.

Nosotros pensamos el marketing por ellos. Esto es el salto de categoría: dejás de ser software → pasás a ser resultado.

---

## 3. North Star Metric

> **Revenue incremental generado por restaurante.**
> Ingresos que NO existirían sin las decisiones del sistema.

Todo el producto, roadmap y decisiones del equipo se evalúan contra esta métrica única.

**Métricas que NO optimizamos:** open rate, click rate, cantidad de mensajes enviados, cantidad de campañas. Si no mueven ingresos, no importan.

---

## 4. El rol de Claude como agente de revenue

Claude no es un chatbot que responde preguntas. Es el **cerebro comercial** que opera en tres dimensiones:

### 4.1 Claude detecta oportunidades

El agente analiza continuamente los datos del restaurante y responde una sola pregunta:

> "¿Qué oportunidad de ingreso existe hoy y qué acción concreta debe ejecutarse?"

Detecta cosas como:

- Un cliente valioso que no viene hace 45 días (y su frecuencia habitual era quincenal)
- 8 mesas vacías para mañana a la noche (cuando el promedio es 2)
- Un cluster de clientes nuevos que visitaron una vez y nunca volvieron
- Un día de la semana con ocupación consistentemente baja
- Un cliente VIP que tuvo una mala experiencia en su última visita

### 4.2 Claude decide la acción

Cada decisión que produce es explícita y estructurada:

- **Público objetivo** — clientes concretos, no segmentos abstractos
- **Objetivo de negocio** — reactivación, llenar ociosidad, aumentar frecuencia, convertir primera visita en segunda
- **Canal recomendado** — WhatsApp (primario) o email, con fallback
- **Timing** — ventana de envío óptima basada en el comportamiento del cliente
- **Incentivo** — si aplica, con límites claros (no descuentos por default)
- **Métrica de éxito** — reservas, visitas, revenue incremental

### 4.3 Claude personaliza el mensaje

No es copy genérico. Claude genera mensajes personalizados usando el contexto real del cliente:

- Nombre del cliente
- Historial de visitas (cuándo vino la última vez, cuántas veces vino)
- Preferencias conocidas (día preferido, horario, sector del restaurante)
- Tono adecuado al contexto (nostalgia para reactivación, celebración para post-visita)
- Idioma del cliente (español, portugués)

**Ejemplo real de reactivación:**

> "Hola Juan 👋
> Hace un tiempo no te vemos por [Restaurante].
> Esta semana tenemos una mesa esperándote 😉
> ¿Te gustaría venir?"

Sin descuentos al inicio. Nostalgia + cercanía primero. El incentivo es el último recurso, no el primero.

### 4.4 Claude ejecuta (y aprende)

- Envía a través de WhatsApp o email
- Respeta reglas de frecuencia automáticamente
- Trackea si el cliente vuelve a reservar/visitar
- Mide revenue generado por cada acción
- Ajusta decisiones futuras basándose en resultados reales

---

## 5. Los datos que alimentan al agente

### 5.1 Qué datos tenemos (y por qué son oro)

Partimos de una base de **500+ restaurantes activos** en Argentina, Chile, Uruguay, Brasil y México, con datos reales de comportamiento:

| Dato | Por qué importa |
|------|-----------------|
| Historial de visitas completo | Sabemos cuándo vino cada cliente y con qué frecuencia |
| Reservas (fecha, hora, party size, estado) | Dato de alta intención — quien reserva quiere ir |
| No-shows y cancelaciones | Detectamos patrones de riesgo |
| Frecuencia por cliente | Sabemos quién es regular y quién se está yendo |
| Horarios preferidos | Personalizamos timing de contacto |
| Día preferido de la semana | Contactamos en el momento correcto |
| Scores por visita | Sabemos si la experiencia fue buena o mala |
| Reviews y comentarios | Texto libre que Claude puede interpretar |
| Canal y plataforma preferidos | Sabemos por dónde llegó cada cliente |

### 5.2 Perfil del cliente que construimos

Por cada par cliente-restaurante, construimos un perfil con ~79 dimensiones:

- **Identidad**: nombre, teléfono, email, idioma
- **Comportamiento**: total visitas, bookings, walkins, no-shows, cancelaciones
- **Tasas**: no-show rate, cancellation rate, booking conversion rate
- **RFM scores**: recencia (1-5), frecuencia (1-5) — la base de toda segmentación
- **Temporales**: primera visita, última visita, días desde última visita, promedio de días entre visitas
- **Predicción**: próxima visita estimada, días hasta la próxima
- **Preferencias**: turno preferido, día preferido, plataforma preferida, sector preferido
- **Texto libre**: notas de reserva, comentarios del guest, respuestas opcionales — todo interpretable por Claude

### 5.3 Datos mínimos para el MVP del hackathon

No necesitás todo lo anterior. Con esto alcanza para generar impacto real:

**Cliente:** customer_id (unificado), nombre, teléfono, email (si existe), idioma (si se puede inferir)

**Reserva:** fecha, hora, cantidad de personas, estado (asistió / no-show / canceló), restaurante_id

> ⚠️ No intentes perfeccionar identidad ahora. Lo suficientemente bueno > perfecto.

---

## 6. Modelo de ciclo de vida del cliente

El sistema organiza cada cliente en un **estado operativo** — no es analítico, es accionable. Cada estado tiene una acción concreta asociada.

| Estado | Quién es | Qué hace Claude | Métrica |
|--------|----------|-----------------|---------|
| 🟣 **Lead** | Interactuó pero nunca visitó (escribió por WhatsApp, consultó, inició reserva) | Convertir en primera visita | Tasa de conversión a cliente |
| 🔵 **Nuevo** | Hizo su primera visita recientemente | Convertir en segunda visita | Tasa de segunda visita |
| 🟢 **Activo** | Visita con cierta frecuencia | Mantener relación, pedir reviews | Frecuencia de visita |
| 🟡 **En riesgo** | Antes era activo, está dejando de venir | Recuperación preventiva | Tasa de recuperación |
| 🔴 **Dormido** | No visita hace un período prolongado | Reactivación con contexto | Revenue recuperado |
| ⭐ **VIP** | Alta frecuencia o alto valor | Potenciar relación, experiencias exclusivas | Frecuencia + ticket promedio |

**Reglas importantes:**

- Los umbrales de cada estado son **configurables por restaurante** (un bar no es igual a un fine dining)
- La relación entre estados y acciones es **many-to-many** internamente (un cliente en riesgo puede recibir tanto un mensaje de recuperación como una invitación a un evento)
- El restaurante ve esto como un dashboard simple: "Estado de tus clientes" con volúmenes y tendencias

### La visualización para el restaurante

```
Estado de tus clientes:
🟣 Leads:      820
🔵 Nuevos:     380
🟢 Activos:  1.240
🟡 En riesgo:  620
🔴 Dormidos: 4.532
⭐ VIP:        210
```

Cada segmento incluye volumen, tendencia (↑ ↓), y acción directa.

> 👉 Esto convierte al producto en un sistema que detecta dónde está el problema y ejecuta la acción correspondiente.

---

## 7. Los 5 momentos fundacionales (casos de uso V1)

Estos 5 casos fueron elegidos porque en conjunto cubren todo el ciclo de vida, combinan acciones automáticas y manuales, tienen impacto directo en revenue, y generan resultados en el corto plazo.

### 🥇 1. Post-visita inteligente (flujo adaptativo)

**Tipo:** Automático (always-on)

**El problema:** El cliente visita el restaurante y no se vuelve a generar contacto ni relación.

**Lo que hace Claude:**

Este no es un mensaje simple. Es un **flujo adaptativo** que ajusta la acción según el comportamiento del cliente:

1. **Trigger:** Visita detectada
2. **Paso 1:** Mensaje de agradecimiento — refuerzo de experiencia, tono humano
3. **Paso 2 (adaptativo):**
   - Si responde positivamente → solicitar review, reforzar vínculo
   - Si no responde → recordatorio suave, invitar a volver
4. **Paso 3:** Invitación a segunda visita

**Métricas:** tasa de respuesta, tasa de review, tasa de segunda visita, revenue generado

### 🥈 2. Primera visita → Segunda visita

**Tipo:** Automático

**El problema:** Gran parte de los clientes no vuelve después de su primera visita. Este es el punto más crítico de fuga.

**Lo que hace Claude:**

- Identifica clientes que acaban de hacer su primera visita
- Genera un contacto específico enfocado en conversión
- Posible incentivo leve (solo si los datos lo justifican)

**Métricas:** tasa de segunda visita, tiempo hasta segunda visita

### 🥉 3. Reactivación de clientes inactivos

**Tipo:** Automático (activable)

**El problema:** Clientes que ya conocían el restaurante dejan de visitarlo. La mayor bolsa de revenue desaprovechado.

**Lo que hace Claude:**

- Detecta inactividad automáticamente (basado en frecuencia histórica del cliente)
- Genera comunicación contextual personalizada
- Puede incluir incentivo o novedad

**MVP recomendado para el hackathon:**

> **Trigger:** Cliente asistió 2+ veces, no vino en 45-60 días
> **Acción:** Mensaje ultra simple y humano, un solo canal (WhatsApp)
> **Sin descuentos al inicio.** Probá nostalgia + cercanía primero.
> **Éxito:** % reservas reactivadas + feedback cualitativo del dueño

**Métricas:** tasa de reactivación, revenue recuperado

### 🏅 4. Promocionar evento o experiencia

**Tipo:** Manual (on-demand)

**El problema:** El restaurante tiene una necesidad puntual de llenar un evento o experiencia.

**Lo que hace Claude:**

- El restaurante selecciona el caso de uso
- Claude sugiere la audiencia automáticamente (los clientes con mayor probabilidad de interesarse)
- Genera mensaje predefinido personalizado
- Envío inmediato

**Métricas:** reservas generadas, revenue del evento

### 🏅 5. Llenar mesas en días de baja ocupación

**Tipo:** Manual (V1) → Automático (V2)

**El problema:** Días o franjas horarias con baja ocupación consistente.

**Lo que hace Claude:**

- Identifica patrones de ocupación baja
- Sugiere clientes a contactar (los que históricamente vienen ese día, o los que tienen flexibilidad)
- Genera invitación a visitar

**Métricas:** ocupación incremental, revenue incremental

### El loop de valor

Estos casos no son independientes. Son un **sistema integrado**:

```
Cliente visita → Post-visita inteligente → Se incentiva segunda visita
→ Si no vuelve → Se reactiva → Se generan oportunidades puntuales (eventos / ocupación)
→ Mayor frecuencia → Mayor fidelización → Más revenue mensual
```

---

## 8. Cómo funciona el canal

### 8.1 WhatsApp es EL canal

En LATAM, WhatsApp tiene penetración superior al 90%. Los números son contundentes:

| Canal | Open Rate | Conversion |
|-------|-----------|------------|
| Email | 20-30% | 2-5% |
| SMS | 70-80% | 10-20% |
| **WhatsApp** | **95-99%** | **45-60%** |

Es el canal más sub-servido en restaurant tech globalmente. Los competidores de USA priorizan email y SMS — WhatsApp es el gap y nuestra mayor ventaja.

### 8.2 Email como complementario

Email entra como canal secundario. Útil para comunicaciones más largas, newsletters, y como fallback cuando WhatsApp no está disponible.

Separación clave: email transaccional (confirmaciones) vs. email marketing (campañas) usan infraestructura separada para proteger reputación del sender.

### 8.3 El chatbot como habilitador (no como producto)

El chatbot de WhatsApp **no es el producto**. Es el habilitador del canal.

**Su función real:** crear, capturar y fortalecer la relación con el cliente.

Qué hace:
- Responde consultas inbound (horarios, ubicación, menú, disponibilidad)
- Guía al cliente hacia acciones (reservar, ver experiencias)
- Genera opt-in para comunicación futura
- Captura contexto (qué preguntó, qué le interesa)
- Habilita el outbound (sin conversación previa, los mensajes salientes pierden efectividad)

**El chatbot no genera revenue directamente. Pero multiplica el impacto del sistema que sí lo genera.**

Principio de configuración: **customización de contenido, no de comportamiento.** El restaurante puede editar qué dice el bot, pero no cómo funciona.

### 8.4 Engagement sin spam

Reglas hardcodeadas que protegen la relación con el cliente:

- **Límite de impactos por cliente** — máximo 1 mensaje cada X días
- **Prioridad por valor esperado** — si hay que elegir entre enviar un mensaje de reactivación o uno de evento, gana el de mayor impacto esperado
- **Exclusión automática** — si un cliente no responde consistentemente, se deja de contactar
- **Canales según comportamiento** — no todo va por WhatsApp; el sistema elige el canal óptimo
- **Quiet hours** — no contactar en horarios inapropiados
- **Opt-in verificado** — nunca se contacta sin consentimiento

> "El sistema cuida la relación con tus clientes como si fuera suya."

---

## 9. Cómo Claude toma decisiones (architecture del agente)

### 9.1 Las 3 capas del sistema

El producto se diseña como tres capas con responsabilidades claras:

**CAPA 1 — Datos del cliente (silenciosa)**

Construye la fuente única de verdad. Unifica identidad, ingesta datos de múltiples fuentes (reservas, visitas, interacciones), calcula features (recencia, frecuencia, valor, probabilidad de churn, sensibilidad a incentivos, horarios preferidos). Esta capa es invisible para el restaurante — existe solo para habilitar mejores decisiones.

**CAPA 2 — Motor de decisiones (el core, donde vive Claude)**

Esta es la ventaja competitiva central. Claude opera acá, respondiendo continuamente: "¿qué oportunidad de ingreso existe hoy y qué acción concreta debe ejecutarse?"

Produce decisiones explícitas y estructuradas (no ideas vagas). Cada decisión tiene público, objetivo, canal, timing, incentivo y métrica de éxito.

Lo que NO vive acá: workflows de mensajería, lógica de retries, gestión de templates por canal.

**CAPA 3 — Ejecución (externa)**

Infraestructura de comunicación. No la construimos nosotros — nos apoyamos en proveedores especializados (WhatsApp API, email). Esta capa ejecuta el cómo.

> **Principio de frontera:** el sistema decide el QUÉ y el POR QUÉ. La infraestructura de envío ejecuta el CÓMO. La estrategia comercial nunca vive fuera del sistema.

### 9.2 Decisión clave: automations deterministas, no agentes autónomos

Para el MVP, la recomendación es clara:

**NO empezar con agentes autónomos LLM-based para la lógica de decisión.**

No porque la visión esté mal (es excelente), sino porque:

- Introducen incertidumbre en un momento donde necesitás confianza del restaurante
- Generan desconfianza ("¿qué le mandó a mi cliente?")
- Requieren tuning fino que consume tiempo
- No necesitás creatividad ahora, necesitás **consistencia**

**Para un MVP B2B SMB: predictabilidad > sofisticación.**

Claude entra como:
1. **Generador de mensajes personalizados** — dado un template y contexto del cliente, Claude genera la variante personalizada
2. **Analizador de oportunidades** — dado un dataset de clientes, Claude identifica los mejores candidatos para cada acción
3. **Intérprete de texto libre** — Claude extrae insights de notas de reserva, comentarios y reviews

La lógica de trigger ("si el cliente no vino en 45 días, activar reactivación") es determinista. Claude personaliza y enriquece, no decide si la regla se dispara.

### 9.3 El flujo de una decisión

```
1. DATOS         → El pipeline actualiza el perfil del cliente
2. DETECCIÓN     → Reglas deterministas identifican una oportunidad
                   (ej: cliente VIP no vino en 50 días, su frecuencia era 15 días)
3. DECISIÓN      → Se selecciona el caso de uso y la audiencia
4. PERSONALIZACIÓN → Claude genera el mensaje personalizado con contexto real
5. GOVERNOR      → Filtro de frecuencia, opt-in, quiet hours, canal
6. EJECUCIÓN     → Envío via WhatsApp o email
7. TRACKING      → Se registra el envío, se espera el outcome
8. ATRIBUCIÓN    → Si el cliente reserva/visita, se atribuye revenue
9. APRENDIZAJE   → Los resultados alimentan las próximas decisiones
```

---

## 10. Métricas del sistema

### Lo que medimos

**Métricas primarias (producto):**
- % de restaurantes con al menos una acción activa
- % de acciones aprobadas vs sugeridas
- Tiempo desde "oportunidad detectada" hasta "acción ejecutada"
- Número de decisiones automáticas por restaurante / mes

**Métricas de impacto (negocio):**
- Clientes reactivados
- Reservas incrementales
- Visitas recuperadas (reservas + walkins + waiting list — no solo reservas)
- Revenue incremental absoluto
- Revenue incremental por cliente contactado

**Métricas de calidad (guardrails):**
- Quejas / opt-outs
- Frecuencia de contacto por cliente
- Acciones revertidas o desactivadas
- Errores de ejecución / delivery

### Lo que el restaurante ve

Un dashboard simple con impacto claro:

```
Revenue generado por el sistema este mes: $2,350

┌─────────────────────────────────────┐
│ Reactivación:                       │
│   312 mensajes enviados             │
│   47 clientes reactivados           │
│   $1,880 revenue estimado           │
│                                     │
│ Post-visita:                        │
│   890 mensajes enviados             │
│   12 reviews generadas              │
│   28 segundas visitas               │
│   $470 revenue estimado             │
└─────────────────────────────────────┘
```

Cuando el restaurante ve esto, el valor del producto se vuelve indiscutible.

---

## 11. Landscape competitivo

### El vacío

No existe ningún sistema como este en Latinoamérica. El mercado estadounidense tiene soluciones maduras (con ROI documentado de 7x en campañas segmentadas, 11% crecimiento de ventas por unidad), pero LATAM es un vacío casi total.

### Por qué nadie lo hizo todavía

- Los competidores globales (SevenRooms, Toast, OpenTable) permanecen en el paradigma de "campaign builder" que requiere configuración humana
- Los competidores regionales ofrecen funcionalidades parciales pero ninguno tiene un motor autónomo
- Nadie reclama explícitamente la categoría de "ejecución autónoma"

### Nuestra diferenciación

| Lo que ofrecen todos | Lo que ofrecemos nosotros |
|---------------------|--------------------------|
| Herramientas para enviar mensajes | Sistema que decide qué enviar, a quién y cuándo |
| Campaign builder manual | Approve, don't configure |
| Email + SMS como canales principales | WhatsApp-native (95%+ open rates en LATAM) |
| Métricas de engagement | Métricas de revenue |
| Requiere un marketer | Funciona sin marketer |
| Segmentación manual | Audiencias automáticas |
| Copy genérico | Mensajes personalizados por IA |

### Pricing de referencia

El mercado US cobra $95-560/localización/mes. Nuestra oportunidad en LATAM: $50-150 USD, ajustado al poder adquisitivo regional, y con un ROI demostrable desde el día 1.

---

## 12. Principios de producto

### Los 5 mandamientos

1. **Revenue > actividad** — Si no mueve ingresos, no importa.

2. **Decisiones cerradas** — El restaurante aprueba o no. No configura. Menos opciones, más impacto.

3. **Automatización con control** — Determinismo primero. IA generativa como soporte, no como cerebro. Todo lo automático debe poder explicarse, apagarse y medirse.

4. **White label total** — El restaurante percibe que "el sistema se encarga". No debe sentir que está usando una herramienta compleja.

5. **Infraestructura como leverage** — Todo lo no diferencial se compra o delega. No construimos lo que otro ya resolvió.

### Naturaleza del producto

El producto se organiza en torno a **casos de uso, no features.** El usuario piensa en problemas ("tengo mesas vacías el martes"), no en herramientas ("quiero crear un segmento RFM con filtro temporal").

Cada caso de uso tiene un objetivo claro, una audiencia sugerida, un mensaje predefinido, un canal sugerido, y puede ser ejecutado manualmente o activado automáticamente.

### Evolución natural

```
Etapa 1 → Activación manual (casos simples, alto control, generar confianza)
Etapa 2 → Optimización (mejores audiencias, mejores mensajes, mejores resultados)
Etapa 3 → Automatización (activaciones recurrentes, menor intervención)
Etapa 4 → Sistema proactivo (detecta oportunidades, sugiere acciones, eventualmente ejecuta solo)
```

---

## 13. Principios del equipo

> "No somos un equipo de features. Somos un equipo de decisiones con impacto económico."

### Cómo pensamos

- Pensamos en **sistemas**, no en tickets
- Cuestionamos pedidos sin hipótesis de impacto económico claro
- Proponemos hipótesis, no solo soluciones
- Mostramos trabajo incompleto sin miedo
- Matamos ideas rápido cuando los datos lo indican

### Cómo trabajamos

No usamos Scrum clásico. No trabajamos con roadmaps de features. Trabajamos con **apuestas** (no features), **aprendizaje continuo** (no cumplimiento de planes), y **decisiones explícitas** (no progreso implícito).

**Ritmo:**
- Mensual: North Star + Bets
- Semanal: Ciclo de aprendizaje (cada semana debe producir al menos una hipótesis validada o una decisión tomada)
- Diario: Trabajo autónomo y asincrónico

### Artefactos mínimos (pero sagrados)

- **Learning Log:** hipótesis → experimento → resultado → decisión
- **Decision Log:** qué se decidió, por qué, con qué datos
- **Metric Snapshot:** 1 North Star + 1-2 métricas de soporte

Todo lo demás es ruido.

### Señales de alerta

Paramos y corregimos si:
- 🚨 Hablamos más de tickets que de impacto
- 🚨 Nos piden fechas antes que hipótesis
- 🚨 Medimos actividad en lugar de revenue
- 🚨 Sumamos configuraciones "por las dudas"
- 🚨 Dejamos de matar ideas

---

## 14. Quick reference para el hackathon

### Qué construir primero

**Un solo caso de uso, end-to-end:** Reactivación inteligente.

1. Tomar datos reales de clientes de restaurantes
2. Identificar clientes que cumplan el trigger (2+ visitas, última hace 45-60 días)
3. Usar Claude para generar mensajes personalizados con contexto del cliente
4. Simular/ejecutar envío por WhatsApp
5. Medir si vuelven

### Lo que Claude necesita para generar un buen mensaje

```json
{
  "guest_name": "Juan Pérez",
  "restaurant_name": "La Cabrera",
  "total_visits": 7,
  "last_visit_date": "2026-02-15",
  "days_since_last_visit": 58,
  "avg_days_between_visits": 18,
  "preferred_day": "jueves",
  "preferred_shift": "noche",
  "preferred_sector": "barra",
  "last_score": 4.5,
  "guest_language": "es",
  "lifecycle_state": "dormant"
}
```

### Prompt base para Claude (generación de mensajes)

```
Sos el asistente de comunicación de {restaurant_name}.
Tu objetivo es generar un mensaje de WhatsApp para reactivar a un cliente
que no viene hace {days_since_last_visit} días.

Contexto del cliente:
- Se llama {guest_name}
- Visitó {total_visits} veces
- Su frecuencia habitual era cada {avg_days_between_visits} días
- Prefiere venir los {preferred_day} a la {preferred_shift}
- Su último score fue {last_score}/5

Reglas:
- Máximo 3 líneas
- Tono cercano, no corporativo
- NO ofrecer descuentos
- Incluir un call-to-action claro (invitar a venir, no a reservar formalmente)
- Usar nostalgia y cercanía, no urgencia
- Idioma: {guest_language}
```

### Stack sugerido para el hackathon

| Componente | Qué usar |
|------------|----------|
| Datos | PostgreSQL o JSON estático con datos de ejemplo |
| Lógica de trigger | Script simple (Python/TypeScript) que filtra clientes |
| Personalización | Claude API (claude-sonnet-4-20250514) |
| Canal | WhatsApp API (Kapso) o simulación |
| Dashboard | React + Recharts o cualquier frontend rápido |
| Tracking | Tabla simple de envíos + outcomes |

### Criterio de éxito del hackathon

No es "que funcione técnicamente." Es:

- ¿Se detectaron oportunidades reales en datos reales?
- ¿Claude generó mensajes que un restaurante aprobaría?
- ¿El restaurante puede ver el impacto claramente?
- ¿El flujo end-to-end funciona sin intervención manual?

---

## 15. Moat y visión a largo plazo

### El moat

Tenemos datos que otros no tienen. Historial de visitas, frecuencia, horarios, comportamiento de reservas, cancelaciones, no-shows de 500+ restaurantes reales.

Mientras más datos se acumulan → mejores decisiones → mejores resultados → más restaurantes → más datos. Flywheel clásico.

### La visión a largo plazo

Revenue Autopilot es solo el primer paso. A largo plazo, el sistema podrá:

- Predecir demanda por día/hora
- Optimizar precios dinámicamente
- Recomendar cambios de menú basados en datos
- Gestionar loyalty programs sin fricción
- Ejecutar cross-selling entre restaurantes de la misma franquicia
- Operar como el CMO virtual de cada restaurante, todos los días, automáticamente

---

*Este documento es operativo, no aspiracional. Y nos compromete.*

*Construiremos sistemas que decidan mejor que humanos cansados. Defenderemos la simplicidad frente al ruido. Priorizaremos impacto económico sobre comodidad interna. Aprenderemos más rápido de lo que el mercado cambia.*
