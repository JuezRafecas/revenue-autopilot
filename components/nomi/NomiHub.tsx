'use client';

import { useCallback, useMemo, useRef } from 'react';
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

export function NomiHub({ initial }: NomiHubProps) {
  const chatRef = useRef<NomiChatHandle | null>(null);

  const seedChat = useCallback((prompt: string) => {
    chatRef.current?.send(prompt);
  }, []);

  const approveOpportunity = useCallback(
    (opportunityId: string) => {
      seedChat(
        `Aprobar oportunidad ${opportunityId}. Armá el borrador con el template correspondiente y explicá por qué.`
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
            maxWidth: 820,
            paddingLeft: 'clamp(1rem, 3vw, 2rem)',
            paddingRight: 'clamp(1rem, 3vw, 2rem)',
            paddingTop: 'clamp(1.25rem, 2.5vw, 1.75rem)',
            paddingBottom: 'clamp(0.75rem, 1.5vw, 1rem)',
          }}
        >
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
        </section>

        <section
          className="mx-auto w-full shrink-0"
          style={{
            maxWidth: 820,
            paddingLeft: 'clamp(1rem, 3vw, 2rem)',
            paddingRight: 'clamp(1rem, 3vw, 2rem)',
            paddingBottom: 'clamp(0.75rem, 1.5vw, 1rem)',
          }}
        >
          <OpportunityStrip
            opportunities={initial.opportunities}
            currency={currency}
            error={initial.error}
          />
        </section>

        <section
          className="mx-auto w-full flex-1 min-h-0"
          style={{
            maxWidth: 820,
            paddingLeft: 'clamp(1rem, 3vw, 2rem)',
            paddingRight: 'clamp(1rem, 3vw, 2rem)',
            paddingBottom: 'clamp(1rem, 2vw, 1.5rem)',
            display: 'flex',
          }}
        >
          <NomiChat handleRef={chatRef} currency={currency} />
        </section>
      </div>
    </NomiHubContext.Provider>
  );
}
