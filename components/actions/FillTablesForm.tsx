'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';

const DAYS = [
  { key: 'monday', label: 'Lunes' },
  { key: 'tuesday', label: 'Martes' },
  { key: 'wednesday', label: 'Miércoles' },
  { key: 'thursday', label: 'Jueves' },
  { key: 'friday', label: 'Viernes' },
  { key: 'saturday', label: 'Sábado' },
  { key: 'sunday', label: 'Domingo' },
];

const SHIFTS = [
  { key: 'lunch', label: 'Almuerzo' },
  { key: 'dinner', label: 'Cena' },
];

export function FillTablesForm({
  onSubmit,
}: {
  onSubmit?: (day: string, shift: string) => void;
}) {
  const [day, setDay] = useState('thursday');
  const [shift, setShift] = useState('dinner');

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.(day, shift);
      }}
      className="border border-hairline p-12 bg-bg-raised"
    >
      <Label className="mb-3">Llenar mesas</Label>
      <h2
        className="font-display text-[clamp(2rem,4vw,3.5rem)] leading-[0.98] text-fg mb-12 max-w-[20ch]"
        style={{ fontVariationSettings: '"opsz" 144, "SOFT" 50' }}
      >
        <span className="italic">¿Qué mesa</span> querés{' '}
        <span className="text-accent not-italic">llenar</span>?
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div>
          <Label className="mb-3">Día</Label>
          <div className="grid grid-cols-2 gap-2">
            {DAYS.map((d) => (
              <button
                key={d.key}
                type="button"
                onClick={() => setDay(d.key)}
                className={`border border-hairline px-4 py-3 text-left font-sans text-sm transition-colors ${
                  day === d.key
                    ? 'bg-accent text-bg border-accent'
                    : 'text-fg-muted hover:text-fg hover:bg-bg'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label className="mb-3">Horario</Label>
          <div className="grid grid-cols-1 gap-2">
            {SHIFTS.map((s) => (
              <button
                key={s.key}
                type="button"
                onClick={() => setShift(s.key)}
                className={`border border-hairline px-4 py-3 text-left font-sans text-sm transition-colors ${
                  shift === s.key
                    ? 'bg-accent text-bg border-accent'
                    : 'text-fg-muted hover:text-fg hover:bg-bg'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-12 pt-8 border-t border-hairline flex items-center justify-between gap-4">
        <p
          className="font-display italic text-sm text-fg-muted max-w-[40ch]"
          style={{ fontVariationSettings: '"opsz" 14' }}
        >
          buscaremos comensales con alta probabilidad de aceptar una invitación para ese día.
        </p>
        <Button variant="primary" size="lg" type="submit">
          Buscar matches
        </Button>
      </div>
    </form>
  );
}
