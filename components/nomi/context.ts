'use client';

import { createContext, useContext } from 'react';

export interface NomiHubContextValue {
  seedChat: (prompt: string) => void;
  approveOpportunity: (opportunityId: string) => void;
}

export const NomiHubContext = createContext<NomiHubContextValue | null>(null);

export function useNomiHub(): NomiHubContextValue {
  const ctx = useContext(NomiHubContext);
  if (!ctx) {
    throw new Error('useNomiHub must be used inside <NomiHub>');
  }
  return ctx;
}
