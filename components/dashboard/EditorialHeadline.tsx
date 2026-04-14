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
  const fullText = `${prefix} ${highlight} ${suffix}`;
  const words = fullText.split(' ');
  const highlightWords = highlight.split(' ');
  const highlightStart = prefix.split(' ').length;
  const highlightEnd = highlightStart + highlightWords.length - 1;

  return (
    <h1
      className={cn(
        'font-display italic font-light',
        'text-[clamp(2.5rem,6vw,6rem)] leading-[0.98] tracking-[-0.02em]',
        'text-fg max-w-[22ch]',
        className
      )}
      style={{
        fontVariationSettings: '"opsz" 144, "SOFT" 100, "WONK" 1',
      }}
    >
      {words.map((word, i) => {
        const isHighlight = i >= highlightStart && i <= highlightEnd;
        return (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: 14, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0)' }}
            transition={{
              duration: 0.7,
              delay: i * 0.06,
              ease: [0.16, 1, 0.3, 1],
            }}
            className={cn('inline-block', isHighlight && 'text-accent')}
          >
            {word}
            {i < words.length - 1 && '\u00A0'}
          </motion.span>
        );
      })}
    </h1>
  );
}
