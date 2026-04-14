import { AppShell } from '@/components/layout/AppShell';
import { Header } from '@/components/layout/Header';
import { CSVUploader } from '@/components/upload/CSVUploader';

export default function UploadPage() {
  return (
    <AppShell>
      <Header />
      <CSVUploader />
    </AppShell>
  );
}
