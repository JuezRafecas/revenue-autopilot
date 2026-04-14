export function ActivityTicker({ items }: { items: string[] }) {
  const doubled = [...items, ...items];
  return (
    <div className="border-t border-b border-hairline py-3 overflow-hidden">
      <div
        className="flex gap-16 whitespace-nowrap animate-marquee hover:[animation-play-state:paused]"
        style={{ width: 'max-content' }}
      >
        {doubled.map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.12em] text-fg-subtle"
          >
            <span className="h-1 w-1 bg-accent rounded-full" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
