'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';

export function Drawer({
  open,
  onClose,
  children,
  title,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-bg-sunken/70 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.aside
            className="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-bg-raised border-l border-hairline overflow-y-auto"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          >
            {title && (
              <header className="border-b border-hairline px-8 py-6 flex items-center justify-between">
                <h2 className="font-display text-2xl">{title}</h2>
                <button
                  onClick={onClose}
                  className="text-fg-subtle hover:text-fg text-[11px] uppercase tracking-label"
                >
                  Cerrar
                </button>
              </header>
            )}
            <div className="p-8">{children}</div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
