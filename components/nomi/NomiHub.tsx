'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import type { Opportunity } from '@/lib/agent/types';
import { OpportunityStrip } from './OpportunityStrip';
import { NomiChat, type NomiChatHandle } from './NomiChat';
import { NomiHubContext, type NomiHubContextValue } from './context';

interface NomiHubProps {
  initial: {
    restaurant:
      | {
          id: string;
          name: string;
          slug: string;
          avg_ticket: number;
          currency: string;
        }
      | null;
    opportunities: Opportunity[];
    total_guests: number;
    error: string | null;
  };
}

const SECTION_MAX_WIDTH = 1120;

export function NomiHub({ initial }: NomiHubProps) {
  const chatRef = useRef<NomiChatHandle | null>(null);
  const [engaged, setEngaged] = useState(false);

  const seedChat = useCallback((prompt: string) => {
    chatRef.current?.send(prompt);
  }, []);

  const approveOpportunity = useCallback(
    (opportunityId: string) => {
      seedChat(
        `Approve opportunity ${opportunityId}. Draft it using the matching template and explain why.`
      );
    },
    [seedChat]
  );

  const ctx = useMemo<NomiHubContextValue>(
    () => ({ seedChat, approveOpportunity }),
    [seedChat, approveOpportunity]
  );

  const currency = initial.restaurant?.currency ?? 'ARS';

  return (
    <NomiHubContext.Provider value={ctx}>
      <div
        className="flex flex-col"
        style={{
          height: '100vh',
          maxHeight: '100vh',
          overflow: 'hidden',
        }}
      >
        <section
          className="mx-auto w-full shrink-0"
          style={{
            maxWidth: SECTION_MAX_WIDTH,
            paddingLeft: 'clamp(1rem, 3vw, 2rem)',
            paddingRight: 'clamp(1rem, 3vw, 2rem)',
            paddingTop: engaged
              ? 'clamp(0.5rem, 1vw, 0.75rem)'
              : 'clamp(1.25rem, 2.5vw, 1.75rem)',
            paddingBottom: engaged
              ? 'clamp(0.25rem, 0.6vw, 0.5rem)'
              : 'clamp(0.75rem, 1.5vw, 1rem)',
            transition: 'padding 240ms cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
          {engaged ? (
            <div
              className="flex items-center gap-2"
              style={{
                fontFamily:
                  'var(--font-kaszek-sans), Inter, -apple-system, sans-serif',
                fontSize: 11,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--fg-subtle)',
                fontWeight: 600,
              }}
            >
              <span style={{ color: 'var(--k-green)' }}>Nomi</span>
              <span aria-hidden style={{ opacity: 0.5 }}>·</span>
              <span>watching your restaurant</span>
            </div>
          ) : (
            <h1
              className="leading-[1.02]"
              style={{
                fontFamily:
                  'var(--font-kaszek-display), "Archivo Black", system-ui, sans-serif',
                fontWeight: 800,
                fontSize: 'clamp(1.55rem, 2.6vw, 2.1rem)',
                letterSpacing: '-0.035em',
                color: 'var(--fg)',
              }}
            >
              Nomi is{' '}
              <span
                className="k-italic-serif"
                style={{
                  fontFamily: 'var(--font-display), Georgia, serif',
                  fontWeight: 400,
                  color: 'var(--accent-dim)',
                }}
              >
                watching
              </span>{' '}
              your restaurant.
            </h1>
          )}
        </section>

        <section
          className="mx-auto w-full shrink-0"
          style={{
            maxWidth: SECTION_MAX_WIDTH,
            paddingLeft: 'clamp(1rem, 3vw, 2rem)',
            paddingRight: 'clamp(1rem, 3vw, 2rem)',
            paddingBottom: 'clamp(0.75rem, 1.5vw, 1rem)',
          }}
        >
          <OpportunityStrip
            opportunities={initial.opportunities}
            currency={currency}
            error={initial.error}
            collapsed={engaged}
          />
        </section>

        <section
          className="mx-auto w-full flex-1 min-h-0"
          style={{
            maxWidth: SECTION_MAX_WIDTH,
            paddingLeft: 'clamp(1rem, 3vw, 2rem)',
            paddingRight: 'clamp(1rem, 3vw, 2rem)',
            paddingBottom: 'clamp(1rem, 2vw, 1.5rem)',
            display: 'flex',
          }}
        >
          <NomiChat
            handleRef={chatRef}
            currency={currency}
            onEngagedChange={setEngaged}
          />
        </section>
      </div>
    </NomiHubContext.Provider>
  );
}
