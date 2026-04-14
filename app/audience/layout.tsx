import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Audiencia · Revenue Autopilot',
};

export default function AudienceLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-theme="kaszek" className="min-h-screen">
      {children}
    </div>
  );
}
