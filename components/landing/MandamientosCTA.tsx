import Link from 'next/link';
import { SectionHeader } from './SectionHeader';
import { KaszekButton, Arrow } from './LandingPrimitives';
import { MANDAMIENTOS, SECTION_HEADERS } from './copy';

export function MandamientosCTASection() {
  return (
    <section
      id="mandamientos"
      className="k-section k-section-hairline editorial-container"
    >
      <SectionHeader
        eyebrow={SECTION_HEADERS.cta.eyebrow}
        title={SECTION_HEADERS.cta.title}
        lead={SECTION_HEADERS.cta.lead}
      />

      <ol className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {MANDAMIENTOS.map((m, i) => (
          <li
            key={m.rank}
            data-reveal="true"
            data-reveal-delay={String(Math.min(i + 1, 6))}
            className="k-card-brutal k-card-brutal--hover p-7 flex flex-col gap-4"
            style={{ background: '#ffffff' }}
          >
            <span className="k-step-digit">{m.rank}</span>
            <h3 className="k-display-md" style={{ fontSize: 20 }}>
              {m.title}
            </h3>
            <p className="text-[13px] leading-relaxed text-[#605e5a]">
              {m.body}
            </p>
          </li>
        ))}
      </ol>

      <div
        data-reveal="true"
        data-reveal-delay="6"
        className="mt-24 pt-16 border-t border-[#e4dfd2] flex flex-col lg:flex-row items-start lg:items-end justify-between gap-10"
      >
        <div className="max-w-[38ch]">
          <div className="k-eyebrow mb-4">Listo para ver el sistema</div>
          <h3 className="k-display-lg">
            Dejá de mandar campañas.
            {'\n'}
            Empezá a recuperar clientes.
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-5">
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
      </div>
    </section>
  );
}
