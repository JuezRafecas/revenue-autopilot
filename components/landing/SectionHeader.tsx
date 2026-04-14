import type { ReactNode } from 'react';

export function SectionHeader({
  eyebrow,
  title,
  lead,
  align = 'left',
  id,
}: {
  eyebrow: string;
  title: string;
  lead?: ReactNode;
  align?: 'left' | 'center';
  id?: string;
}) {
  const alignClass =
    align === 'center' ? 'text-center items-center' : 'text-left items-start';
  const leadMaxClass = align === 'center' ? 'max-w-[58ch] mx-auto' : 'max-w-[58ch]';

  return (
    <header id={id} className={`flex flex-col gap-6 ${alignClass}`}>
      <div data-reveal="true" data-reveal-delay="1" className="k-eyebrow">
        {eyebrow}
      </div>
      <h2
        data-reveal="true"
        data-reveal-delay="2"
        className="k-display-lg"
        style={{ whiteSpace: 'pre-line' }}
      >
        {title}
      </h2>
      {lead && (
        <p
          data-reveal="true"
          data-reveal-delay="3"
          className={`k-body ${leadMaxClass}`}
        >
          {lead}
        </p>
      )}
    </header>
  );
}
