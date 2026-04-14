'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';

interface Props {
  prefix: string;
  highlight: string;
  suffix: string;
  className?: string;
}

export function EditorialHeadline({ prefix, highlight, suffix, className }: Props) {
  const prefixWords = prefix.split(' ');
  const suffixWords = suffix.split(' ');

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <span
        className="text-[10px] uppercase font-[600]"
        style={{
          letterSpacing: '0.18em',
          color: 'var(--k-green, #0e5e48)',
          fontFamily: 'var(--font-kaszek-sans), Inter, system-ui, sans-serif',
        }}
      >
        Headline · Today
      </span>

      <h1
        className="k-display-xl"
        style={{
          fontSize: 'clamp(2rem, 4.6vw, 4rem)',
          maxWidth: '22ch',
          color: 'var(--fg)',
        }}
      >
        {prefixWords.map((word, i) => (
          <motion.span
            key={`p-${i}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: i * 0.05, ease: [0.2, 0.7, 0.2, 1] }}
            className="inline-block"
          >
            {word}
            {'\u00A0'}
          </motion.span>
        ))}

        <motion.span
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.7,
            delay: prefixWords.length * 0.05 + 0.1,
            ease: [0.2, 0.7, 0.2, 1],
          }}
          className="k-digit-outlined inline-block align-baseline"
          style={{
            fontSize: 'clamp(2.4rem, 5.6vw, 5rem)',
            padding: '0 0.04em',
          }}
        >
          {highlight}
        </motion.span>
        {'\u00A0'}

        {suffixWords.map((word, i) => (
          <motion.span
            key={`s-${i}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.55,
              delay: (prefixWords.length + 1 + i) * 0.05 + 0.1,
              ease: [0.2, 0.7, 0.2, 1],
            }}
            className="inline-block"
          >
            {word}
            {i < suffixWords.length - 1 && '\u00A0'}
          </motion.span>
        ))}
      </h1>

      <p
        className="k-italic-serif text-[18px] leading-snug"
        style={{ color: 'var(--fg-muted)', maxWidth: '44ch' }}
      >
        Approve or pass. The system handles the rest.
      </p>
    </div>
  );
}
