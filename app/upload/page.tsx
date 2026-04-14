import type { Metadata } from 'next';
import { AppShell } from '@/components/layout/AppShell';
import { Header } from '@/components/layout/Header';
import { CSVUploader } from '@/components/upload/CSVUploader';

export const metadata: Metadata = {
  title: 'Subir datos · Revenue Autopilot',
};

export default function UploadPage() {
  return (
    <AppShell>
      <Header />
      <CSVUploader />
    </AppShell>
  );
}
