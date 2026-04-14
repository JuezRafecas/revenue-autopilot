'use client';

/**
 * Claude Code–style thinking indicator.
 * A sparkle character that gently rotates and scales, paired with shimmer text
 * that sweeps a warm highlight across from left to right. No gifs — pure CSS,
 * respects prefers-reduced-motion.
 */
export function ThinkingSparkle({ label = 'pensando' }: { label?: string }) {
  return (
    <span className="nomi-thinking inline-flex items-center gap-2">
      <span
        aria-hidden
        className="nomi-sparkle"
        style={{
          display: 'inline-block',
          width: 12,
          height: 12,
          position: 'relative',
        }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
        >
          <path
            d="M12 0 L13.8 10.2 L24 12 L13.8 13.8 L12 24 L10.2 13.8 L0 12 L10.2 10.2 Z"
            fill="currentColor"
          />
        </svg>
      </span>
      <span className="nomi-shimmer">{label}</span>

      <style jsx>{`
        .nomi-thinking {
          color: var(--fg-muted);
        }
        .nomi-sparkle {
          color: var(--accent);
          animation: nomi-sparkle-spin 2.4s cubic-bezier(0.45, 0, 0.2, 1) infinite;
          transform-origin: center;
          filter: drop-shadow(0 0 6px rgba(230, 120, 76, 0.35));
        }
        .nomi-shimmer {
          font-family: var(--font-mono), ui-monospace, monospace;
          font-size: 11px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          background: linear-gradient(
            90deg,
            var(--fg-subtle) 0%,
            var(--fg-subtle) 30%,
            var(--accent-dim) 48%,
            var(--accent) 52%,
            var(--fg-subtle) 70%,
            var(--fg-subtle) 100%
          );
          background-size: 220% 100%;
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: nomi-shimmer-sweep 2.1s linear infinite;
        }
        @keyframes nomi-sparkle-spin {
          0% {
            transform: rotate(0deg) scale(1);
            opacity: 0.55;
          }
          35% {
            transform: rotate(90deg) scale(1.18);
            opacity: 1;
          }
          70% {
            transform: rotate(200deg) scale(0.9);
            opacity: 0.85;
          }
          100% {
            transform: rotate(360deg) scale(1);
            opacity: 0.55;
          }
        }
        @keyframes nomi-shimmer-sweep {
          0% {
            background-position: 180% 0;
          }
          100% {
            background-position: -80% 0;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .nomi-sparkle,
          .nomi-shimmer {
            animation: none;
          }
          .nomi-shimmer {
            -webkit-text-fill-color: var(--fg-muted);
            background: none;
          }
        }
      `}</style>
    </span>
  );
}

/**
 * Small inline shimmer dot — for compact states inside tool badges.
 */
export function PulseDot() {
  return (
    <span
      aria-hidden
      className="nomi-pulse-dot"
      style={{
        display: 'inline-block',
        width: 6,
        height: 6,
        borderRadius: 999,
        background: 'var(--accent)',
        boxShadow: '0 0 0 3px rgba(230, 120, 76, 0.2)',
      }}
    >
      <style jsx>{`
        .nomi-pulse-dot {
          animation: nomi-pulse 1.4s ease-in-out infinite;
        }
        @keyframes nomi-pulse {
          0%,
          100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(0.72);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .nomi-pulse-dot {
            animation: none;
          }
        }
      `}</style>
    </span>
  );
}
