export function NomiHeader() {
  return (
    <section
      className="mx-auto w-full"
      style={{
        maxWidth: 780,
        paddingLeft: 'clamp(1rem, 3vw, 2rem)',
        paddingRight: 'clamp(1rem, 3vw, 2rem)',
        paddingTop: 'clamp(2.5rem, 5vw, 4rem)',
        paddingBottom: 'clamp(1.5rem, 3vw, 2rem)',
      }}
    >
      <h1
        className="leading-[1.02]"
        style={{
          fontFamily:
            'var(--font-kaszek-display), "Archivo Black", system-ui, sans-serif',
          fontWeight: 800,
          fontSize: 'clamp(2rem, 3.4vw, 2.8rem)',
          letterSpacing: '-0.035em',
          color: 'var(--fg)',
        }}
      >
        Nomi está{' '}
        <span
          className="k-italic-serif"
          style={{
            fontFamily: 'var(--font-display), Georgia, serif',
            fontWeight: 400,
            color: 'var(--accent-dim)',
          }}
        >
          mirando
        </span>{' '}
        tu restaurante.
      </h1>
      <p
        className="k-italic-serif mt-3"
        style={{
          fontSize: 18,
          lineHeight: 1.55,
          color: 'var(--fg-muted)',
          maxWidth: 560,
        }}
      >
        Revisa tu CDP las 24 horas, detecta oportunidades de revenue y te arma
        el plan completo. Vos aprobás.
      </p>
    </section>
  );
}
