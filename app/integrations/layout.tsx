import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Integraciones · Revenue Autopilot',
};

export default function IntegrationsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-theme="kaszek" className="min-h-screen">
      {children}
    </div>
  );
}
