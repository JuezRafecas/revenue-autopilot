import Link from 'next/link';
import { EventBadge } from './EventBadge';
import { ParallaxHeroArt } from './ParallaxHeroArt';
import { KaszekButton, Arrow } from './LandingPrimitives';

export function LandingHero() {
  return (
    <section className="relative z-10 editorial-container pt-6 md:pt-8 pb-14 overflow-clip">
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] gap-10 lg:gap-20 items-center">
        {/* LEFT — copy column */}
        <div className="relative">
          <div className="k-reveal k-reveal-1 mb-5">
            <EventBadge />
          </div>

          <h1 className="k-reveal k-reveal-2 k-display-xl mb-4">
            Your restaurant,{' '}
            <span className="italic">generating revenue on</span>{' '}
            <span
              className="inline-block"
              style={{
                color: '#e6784c',
                WebkitTextStroke: '2px #151411',
              }}
            >
              autopilot.
            </span>
          </h1>

          <p className="k-reveal k-reveal-3 k-mono text-[11px] uppercase tracking-[0.16em] text-[#605e5a] max-w-[54ch] mb-4">
            Between{' '}
            <span className="text-[#e6784c] font-semibold">70% and 95%</span>{' '}
            of a restaurant&rsquo;s guests{' '}
            <span className="text-[#151411] font-semibold">
              never become loyal to the brand
            </span>
            . They come once, maybe twice, and vanish without a trace.
          </p>

          <p className="k-reveal k-reveal-3 k-body max-w-[46ch] mb-5">
            <em className="text-[#0e5e48] not-italic font-semibold">Nomi</em>{' '}
            reads your database, spots the revenue leaking out, decides who to
            contact, and writes the messages. You{' '}
            <em className="text-[#e6784c] not-italic font-semibold">
              approve
            </em>
            , you don&rsquo;t configure.
          </p>

          <div className="k-reveal k-reveal-4 flex flex-wrap items-center gap-4">
            <Link href="/hub">
              <KaszekButton variant="primary">
                Enter Autopilot
                <Arrow />
              </KaszekButton>
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
                500+ restaurants · 79 signals · 24h to action
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
