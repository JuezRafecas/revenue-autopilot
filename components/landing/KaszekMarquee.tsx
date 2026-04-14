const ITEMS = [
  'Nomi - Guest Autopilot',
  'Kaszek × Anthropic',
  'Push to Prod Hackathon',
  '14.04.2026',
  'Buenos Aires',
  'Autonomous Diagnosis',
  'Digital House · Belgrano',
  'Approve · Don\u2019t Configure',
];

function Row() {
  return (
    <div className="flex shrink-0 items-center gap-10 pr-10">
      {ITEMS.map((item, i) => (
        <span
          key={i}
          className="flex items-center gap-10 k-display text-[44px] leading-none text-[#151411]"
          style={{ letterSpacing: '-0.035em' }}
        >
          {item}
          <span
            aria-hidden
            className="inline-block h-2 w-2 rounded-full bg-[#e6784c]"
            style={{ boxShadow: '0 0 0 2px #151411' }}
          />
        </span>
      ))}
    </div>
  );
}

export function KaszekMarquee() {
  return (
    <div className="relative overflow-hidden border-y-2 border-[#151411] bg-[#faf8f4] py-5">
      <div className="flex k-marquee whitespace-nowrap">
        <Row />
        <Row />
      </div>
    </div>
  );
}
