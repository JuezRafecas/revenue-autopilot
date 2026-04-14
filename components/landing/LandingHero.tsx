import Link from 'next/link';
import { EventBadge } from './EventBadge';
import { ParallaxHeroArt } from './ParallaxHeroArt';
import { KaszekButton, Arrow, Metric } from './LandingPrimitives';

export function LandingHero() {
  return (
    <section className="relative z-10 editorial-container pt-20 md:pt-24 pb-24 overflow-clip">
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] gap-14 lg:gap-24 items-start">
        {/* LEFT — copy column */}
        <div className="relative">
          <div className="k-reveal k-reveal-1 mb-10">
            <EventBadge />
          </div>

          <h1 className="k-reveal k-reveal-2 k-display-xl mb-8">
            Tu restaurante,{' '}
            <span className="italic">con ingresos en</span>{' '}
            <span
              className="inline-block"
              style={{
                color: '#e6784c',
                WebkitTextStroke: '2px #151411',
              }}
            >
              automático.
            </span>
          </h1>

          <p className="k-reveal k-reveal-3 k-mono text-[11px] uppercase tracking-[0.16em] text-[#605e5a] max-w-[54ch] mb-8">
            Entre el{' '}
            <span className="text-[#e6784c] font-semibold">70% y el 95%</span>{' '}
            de los clientes de un restaurante{' '}
            <span className="text-[#151411] font-semibold">
              nunca se fideliza con la marca
            </span>
            . Vienen una vez, quizás dos, y se pierden sin dejar rastro.
          </p>

          <p className="k-reveal k-reveal-3 k-body max-w-[46ch] mb-12">
            <em className="text-[#0e5e48] not-italic font-semibold">Nomi</em>{' '}
            analiza tu base, detecta la plata que se está yendo,
            decide a quién contactar y escribe los mensajes. Vos{' '}
            <em className="text-[#e6784c] not-italic font-semibold">
              aprobás
            </em>
            , no configurás.
          </p>

          <div className="k-reveal k-reveal-4 flex flex-wrap items-center gap-5 mb-14">
            <Link href="/dashboard">
              <KaszekButton variant="primary">
                Ver el diagnóstico
                <Arrow />
              </KaszekButton>
            </Link>
            <Link href="/hub">
              <KaszekButton variant="ghost">Hablar con Nomi</KaszekButton>
            </Link>
          </div>

          {/* Micro-credits row */}
          <div className="k-reveal k-reveal-5 flex flex-wrap gap-x-10 gap-y-4 pt-10 border-t border-[#e4dfd2]">
            <Metric value="500+" label="Restaurantes en LATAM" />
            <Metric value="79" label="Dimensiones por guest" />
            <Metric value="6" label="Estados de ciclo" />
            <Metric value="24h" label="De datos a acción" />
          </div>
        </div>

        {/* RIGHT — art column */}
        <div className="relative pt-8 lg:pt-2">
          <ParallaxHeroArt />
        </div>
      </div>
    </section>
  );
}
