import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard · Revenue Autopilot',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-theme="kaszek" className="min-h-screen">
      {children}
    </div>
  );
}
