'use client';

import { useState, useRef } from 'react';
import { Label } from '@/components/ui/Label';
import { Button } from '@/components/ui/Button';

export function CSVUploader({
  onFile,
}: {
  onFile?: (file: File) => void;
}) {
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File | null) => {
    if (!file) return;
    setFileName(file.name);
    onFile?.(file);
  };

  return (
    <div className="editorial-container py-32">
      <Label className="mb-6">Paso 1 · Subir datos</Label>
      <h1
        className="font-display text-[clamp(3rem,6vw,6rem)] leading-[0.95] text-fg mb-4 max-w-[14ch]"
        style={{ fontVariationSettings: '"opsz" 144, "SOFT" 50, "WONK" 1' }}
      >
        Subí tu base <span className="italic">de clientes</span>.
      </h1>
      <p
        className="font-display italic text-xl text-fg-muted mb-16 max-w-[48ch]"
        style={{ fontVariationSettings: '"opsz" 144, "SOFT" 100' }}
      >
        un CSV con visitas. lo demás lo hacemos nosotros.
      </p>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFile(e.dataTransfer.files[0] ?? null);
        }}
        onClick={() => inputRef.current?.click()}
        className={`
          cursor-pointer border border-dashed p-24 text-center transition-colors duration-200
          ${dragging ? 'border-accent bg-accent/5' : 'border-hairline-strong hover:border-fg-subtle'}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          className="sr-only"
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        />
        <div className="font-mono text-[11px] uppercase tracking-[0.15em] text-fg-subtle">
          {fileName ? `✓ ${fileName}` : 'Arrastrá el CSV acá · o hacé click para elegir'}
        </div>
      </div>

      <div className="mt-12 flex items-center gap-4">
        <Button variant="primary" disabled={!fileName}>
          Procesar base
        </Button>
        <span className="font-mono text-[11px] text-fg-subtle uppercase tracking-label">
          Formato esperado:{' '}
          <span className="text-fg-muted">guest_name, phone, email, visit_date, …</span>
        </span>
      </div>
    </div>
  );
}
