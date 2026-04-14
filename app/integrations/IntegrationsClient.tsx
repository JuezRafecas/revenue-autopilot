'use client';

import { useState } from 'react';
import { Label } from '@/components/ui/Label';

type Integration = {
  id: string;
  name: string;
  icon: React.ReactNode;
  defaultOn?: boolean;
};

type Category = {
  id: string;
  title: string;
  blurb: string;
  items: Integration[];
};

const CATEGORIES: Category[] = [
  {
    id: 'pos',
    title: 'Regional POS',
    blurb: 'Ticket, check, and table sync',
    items: [
      { id: 'soft-restaurant', name: 'Soft Restaurant', icon: <Monogram text="SR" bg="#b54727" /> },
      { id: 'fudo', name: 'Fudo', icon: <Monogram text="F" bg="#ef6c2a" /> },
      { id: 'toteat', name: 'Toteat', icon: <Monogram text="Tt" bg="#4a3fb0" /> },
      { id: 'saipos', name: 'Saipos', icon: <Monogram text="Sp" bg="#0f2a55" /> },
    ],
  },
  {
    id: 'payments',
    title: 'Payments',
    blurb: 'Conversion attribution and digital payments',
    items: [
      { id: 'mercado-pago', name: 'Mercado Pago', icon: <Monogram text="MP" bg="#0aa7ea" /> },
      { id: 'pix', name: 'Pix', icon: <DiamondMark color="#1aa59a" /> },
      { id: 'transbank', name: 'Transbank', icon: <Monogram text="Tb" bg="#d22f2f" /> },
      { id: 'wompi', name: 'Wompi', icon: <Monogram text="W" bg="#6f45d0" /> },
    ],
  },
  {
    id: 'reservas',
    title: 'Reservations',
    blurb: 'Guest, table, and time slot capture',
    items: [
      { id: 'woki', name: 'Woki', icon: <Monogram text="Wk" bg="#66c242" /> },
      { id: 'opentable', name: 'OpenTable', icon: <Monogram text="OT" bg="#c8203b" /> },
      { id: 'resy', name: 'Resy', icon: <Monogram text="R" bg="#0e0e0e" /> },
    ],
  },
  {
    id: 'delivery',
    title: 'Delivery',
    blurb: 'Orders, zones, and off-premise tickets',
    items: [
      { id: 'rappi', name: 'Rappi', icon: <Monogram text="Rp" bg="#ec255a" /> },
      { id: 'ifood', name: 'iFood', icon: <Monogram text="iF" bg="#e1252b" /> },
      { id: 'pedidos-ya', name: 'PedidosYa', icon: <Monogram text="PY" bg="#d72356" /> },
    ],
  },
  {
    id: 'comunicacion',
    title: 'Communication',
    blurb: 'Direct channel to the guest',
    items: [
      { id: 'whatsapp', name: 'WhatsApp Business API', icon: <WhatsAppMark /> },
    ],
  },
  {
    id: 'wifi',
    title: 'WiFi / Captive Portal',
    blurb: 'Guest identification on connection',
    items: [
      { id: 'google-wifi', name: 'Google WiFi', icon: <WifiMark color="#2a73e0" /> },
      { id: 'captive-portal', name: 'Generic captive portal', icon: <WifiMark color="#3a3a3a" /> },
    ],
  },
  {
    id: 'reviews',
    title: 'Reviews & Feedback',
    blurb: 'Satisfaction and reputation signals',
    items: [
      { id: 'google-reviews', name: 'Google Reviews', icon: <StarMark color="#f6a800" /> },
      { id: 'tripadvisor', name: 'TripAdvisor', icon: <Monogram text="Ta" bg="#0e5e48" /> },
    ],
  },
];

const AVAILABLE = new Set(['woki', 'fudo']);

export function IntegrationsClient() {
  const initial: Record<string, boolean> = {};
  for (const cat of CATEGORIES) {
    for (const item of cat.items) {
      initial[item.id] = AVAILABLE.has(item.id);
    }
  }
  const [state, setState] = useState<Record<string, boolean>>(initial);
  const [toast, setToast] = useState<string | null>(null);

  const total = Object.keys(state).length;
  const active = Object.entries(state).filter(([id, on]) => on && AVAILABLE.has(id)).length;

  const handleToggle = (id: string, name: string) => {
    const next = !state[id];
    setState((s) => ({ ...s, [id]: next }));
    setToast(next ? `${name} conectada` : `${name} desconectada`);
    setTimeout(() => setToast(null), 2200);
  };

  return (
    <section className="editorial-container pt-16 pb-24">
      <Label className="mb-3">Integrations</Label>
      <div className="flex items-end justify-between flex-wrap gap-6 mb-14">
        <h1
          className="font-display text-[clamp(2.25rem,4.6vw,4rem)] leading-[0.95] text-fg max-w-[780px]"
          style={{ fontVariationSettings: '"opsz" 144, "SOFT" 50' }}
        >
          Connect the sources that move revenue.
        </h1>
        <div className="flex items-center gap-3 shrink-0">
          <span
            className="font-mono text-[10px] uppercase"
            style={{ letterSpacing: '0.14em', color: 'var(--fg-subtle)' }}
          >
            Connected
          </span>
          <span
            className="font-mono text-[11px] px-2 py-1"
            style={{
              border: '1px solid var(--fg)',
              color: 'var(--fg)',
              letterSpacing: '0.08em',
            }}
          >
            {String(active).padStart(2, '0')} / {String(total).padStart(2, '0')}
          </span>
        </div>
      </div>

      <div className="space-y-16">
        {CATEGORIES.map((cat) => (
          <div key={cat.id}>
            <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6 md:gap-10 border-t border-hairline pt-6">
              <div>
                <div
                  className="font-mono text-[10px] uppercase mb-2"
                  style={{ letterSpacing: '0.18em', color: 'var(--k-green, #0e5e48)' }}
                >
                  {cat.title}
                </div>
                <div
                  className="k-italic-serif text-[18px] leading-snug"
                  style={{ color: 'var(--fg-subtle)' }}
                >
                  {cat.blurb}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {cat.items.map((item) => {
                  const available = AVAILABLE.has(item.id);
                  return (
                    <IntegrationCard
                      key={item.id}
                      integration={item}
                      available={available}
                      on={!!state[item.id]}
                      onToggle={() => handleToggle(item.id, item.name)}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {toast && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 inline-flex items-center gap-2 px-5 py-3 animate-[fade-up_.3s_ease-out]"
          role="status"
          style={{
            background: 'var(--fg)',
            color: 'var(--bg)',
            fontFamily: 'var(--font-kaszek-sans), Inter, system-ui, sans-serif',
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            boxShadow: '0 8px 24px -8px rgba(21,20,17,0.3)',
          }}
        >
          <span aria-hidden style={{ color: 'var(--k-green)' }}>●</span>
          {toast}
        </div>
      )}
    </section>
  );
}

function IntegrationCard({
  integration,
  available,
  on,
  onToggle,
}: {
  integration: Integration;
  available: boolean;
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className="flex items-center justify-between gap-4 px-4 py-4 transition-colors hover:bg-[var(--bg-raised)]"
      style={{
        background: 'var(--bg-sunken)',
        border: '1px solid var(--hairline)',
        opacity: available ? 1 : 0.7,
      }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="shrink-0">{integration.icon}</div>
        <div className="min-w-0">
          <div
            className="text-[14px] leading-tight truncate"
            style={{
              fontFamily: 'var(--font-kaszek-sans), Inter, system-ui, sans-serif',
              fontWeight: 600,
              color: 'var(--fg)',
            }}
          >
            {integration.name}
          </div>
          <div
            className="font-mono text-[10px] uppercase mt-1"
            style={{
              letterSpacing: '0.14em',
              color: available && on ? 'var(--k-green, #0e5e48)' : 'var(--fg-subtle)',
            }}
          >
            <span
              aria-hidden
              className="inline-block mr-1.5 align-middle"
              style={{
                width: 6,
                height: 6,
                background: available && on ? 'var(--k-green, #0e5e48)' : 'transparent',
                border: available && on ? 'none' : '1px solid var(--fg-faint)',
              }}
            />
            {available ? (on ? 'Connected' : 'Disconnected') : 'Coming soon'}
          </div>
        </div>
      </div>
      {available ? (
        <ToggleSwitch on={on} onToggle={onToggle} label={integration.name} />
      ) : (
        <span
          className="font-mono text-[9.5px] uppercase shrink-0 px-2 py-1"
          style={{
            letterSpacing: '0.16em',
            color: 'var(--fg-subtle)',
            border: '1px solid var(--hairline-strong)',
          }}
        >
          Coming soon
        </span>
      )}
    </div>
  );
}

function ToggleSwitch({
  on,
  onToggle,
  label,
}: {
  on: boolean;
  onToggle: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={`${on ? 'Deactivate' : 'Activate'} ${label}`}
      onClick={onToggle}
      className="relative shrink-0 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-sunken)]"
      style={{
        width: 40,
        height: 22,
        background: on ? 'var(--k-green, #0e5e48)' : 'transparent',
        border: `1px solid ${on ? 'var(--k-green, #0e5e48)' : 'var(--fg-faint)'}`,
      }}
    >
      <span
        aria-hidden
        className="absolute top-1/2 -translate-y-1/2 transition-all"
        style={{
          left: on ? 21 : 3,
          width: 14,
          height: 14,
          background: on ? 'var(--bg)' : 'var(--fg-subtle)',
        }}
      />
    </button>
  );
}

function Monogram({ text, bg }: { text: string; bg: string }) {
  return (
    <div
      className="flex items-center justify-center"
      style={{
        width: 36,
        height: 36,
        background: bg,
        color: '#fff',
        fontFamily: 'var(--font-kaszek-display), "Archivo Black", system-ui, sans-serif',
        fontWeight: 800,
        letterSpacing: '-0.04em',
        fontSize: text.length > 1 ? 13 : 16,
      }}
    >
      {text}
    </div>
  );
}

function DiamondMark({ color }: { color: string }) {
  return (
    <div
      className="flex items-center justify-center"
      style={{ width: 36, height: 36, background: '#0e1a1a' }}
    >
      <svg width="18" height="18" viewBox="0 0 20 20" aria-hidden>
        <path d="M10 2 L18 10 L10 18 L2 10 Z" fill={color} />
      </svg>
    </div>
  );
}

function WhatsAppMark() {
  return (
    <div
      className="flex items-center justify-center"
      style={{ width: 36, height: 36, background: '#128c4a' }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
        <path
          d="M3 21 L4.5 16.5 C3.5 15 3 13.2 3 11.5 C3 6.8 7 3 12 3 C17 3 21 6.8 21 11.5 C21 16.2 17 20 12 20 C10.3 20 8.7 19.6 7.3 18.8 Z"
          fill="none"
          stroke="#fff"
          strokeWidth="1.6"
          strokeLinejoin="miter"
        />
      </svg>
    </div>
  );
}

function WifiMark({ color }: { color: string }) {
  return (
    <div
      className="flex items-center justify-center"
      style={{ width: 36, height: 36, background: '#f3efe6', border: '1px solid var(--hairline)' }}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
        <path d="M2 9 C7 4 17 4 22 9" stroke={color} strokeWidth="1.8" fill="none" strokeLinecap="square" />
        <path d="M5 13 C9 9 15 9 19 13" stroke={color} strokeWidth="1.8" fill="none" strokeLinecap="square" />
        <path d="M8 17 C10 15 14 15 16 17" stroke={color} strokeWidth="1.8" fill="none" strokeLinecap="square" />
        <rect x="11" y="19" width="2" height="2" fill={color} />
      </svg>
    </div>
  );
}

function StarMark({ color }: { color: string }) {
  return (
    <div
      className="flex items-center justify-center"
      style={{ width: 36, height: 36, background: '#0e0e0e' }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
        <path
          d="M12 2 L14.6 8.6 L21.5 9.2 L16.2 13.8 L17.9 20.6 L12 16.9 L6.1 20.6 L7.8 13.8 L2.5 9.2 L9.4 8.6 Z"
          fill={color}
        />
      </svg>
    </div>
  );
}
