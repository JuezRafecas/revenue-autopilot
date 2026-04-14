import Link from 'next/link';
import { EventBadge } from './EventBadge';
import { ParallaxHeroArt } from './ParallaxHeroArt';
import { KaszekButton, Arrow } from './LandingPrimitives';

export function LandingHero() {
  return (
    <section className="relative z-10 editorial-container pt-8 md:pt-10 pb-16 overflow-clip">
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] gap-10 lg:gap-20 items-center">
        {/* LEFT — copy column */}
        <div className="relative">
          <div className="k-reveal k-reveal-1 mb-6">
            <EventBadge />
          </div>

          <h1 className="k-reveal k-reveal-2 k-display-xl mb-5">
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

          <p className="k-reveal k-reveal-3 k-mono text-[11px] uppercase tracking-[0.16em] text-[#605e5a] max-w-[54ch] mb-5">
            Entre el{' '}
            <span className="text-[#e6784c] font-semibold">70% y el 95%</span>{' '}
            de los clientes de un restaurante{' '}
            <span className="text-[#151411] font-semibold">
              nunca se fideliza con la marca
            </span>
            . Vienen una vez, quizás dos, y se pierden sin dejar rastro.
          </p>

          <p className="k-reveal k-reveal-3 k-body max-w-[46ch] mb-7">
            <em className="text-[#0e5e48] not-italic font-semibold">Nomi</em>{' '}
            analiza tu base, detecta la plata que se está yendo, decide a quién
            contactar y escribe los mensajes. Vos{' '}
            <em className="text-[#e6784c] not-italic font-semibold">
              aprobás
            </em>
            , no configurás.
          </p>

          <div className="k-reveal k-reveal-4 flex flex-wrap items-center gap-4">
            <Link href="/dashboard">
              <KaszekButton variant="primary">
                Ver el diagnóstico
                <Arrow />
              </KaszekButton>
            </Link>
            <Link href="/hub">
              <KaszekButton variant="ghost">Hablar con Nomi</KaszekButton>
            </Link>
            <div className="hidden md:flex items-center gap-2 pl-3 border-l border-[#e4dfd2] ml-2">
              <span
                aria-hidden
                className="inline-block h-2 w-2"
                style={{
                  background: '#0e5e48',
                  boxShadow: '0 0 0 1.5px #151411',
                }}
              />
              <span className="k-mono text-[9.5px] uppercase tracking-[0.16em] text-[#605e5a]">
                500+ restaurantes · 79 señales · 24h a acción
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT — art column */}
        <div className="relative">
          <ParallaxHeroArt />
        </div>
      </div>
    </section>
  );
}
