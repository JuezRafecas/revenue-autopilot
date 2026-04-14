import { Sidebar } from './Sidebar';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen relative z-10">
      <Sidebar />
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
