export function Logo({ className }: { className?: string }) {
  return (
    <div className={className}>
      <div
        className="font-display italic text-[22px] leading-none text-fg"
        style={{ fontVariationSettings: '"opsz" 144, "SOFT" 100, "WONK" 1' }}
      >
        Revenue
      </div>
      <div
        className="font-display text-[22px] leading-none text-accent -mt-1"
        style={{ fontVariationSettings: '"opsz" 144, "SOFT" 20' }}
      >
        Journal
      </div>
    </div>
  );
}
