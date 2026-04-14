import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Plantillas · Revenue Autopilot',
};

export default function TemplatesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-theme="kaszek" className="min-h-screen">
      {children}
    </div>
  );
}
