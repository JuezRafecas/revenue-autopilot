import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Campañas · Revenue Autopilot',
};

export default function CampaignsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-theme="kaszek" className="min-h-screen">
      {children}
    </div>
  );
}
