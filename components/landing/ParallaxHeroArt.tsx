'use client';

import { useRef } from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from 'framer-motion';
import { BauhausArt } from './BauhausArt';

/**
 * Wraps BauhausArt with a pointer-following tilt. The whole composition
 * drifts toward the cursor with spring damping. Reduced-motion renders
 * plain BauhausArt without wrappers.
 */
export function ParallaxHeroArt() {
  const reducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);

  const springX = useSpring(rawX, { stiffness: 130, damping: 18, mass: 0.5 });
  const springY = useSpring(rawY, { stiffness: 130, damping: 18, mass: 0.5 });

  // Translate drifts (in px) and rotate (in deg) for a subtle 3D feel
  const translateX = useTransform(springX, [-0.5, 0.5], [-12, 12]);
  const translateY = useTransform(springY, [-0.5, 0.5], [-8, 8]);
  const rotateX = useTransform(springY, [-0.5, 0.5], [3, -3]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [-4, 4]);

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (reducedMotion) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    rawX.set((event.clientX - rect.left) / rect.width - 0.5);
    rawY.set((event.clientY - rect.top) / rect.height - 0.5);
  };

  const onPointerLeave = () => {
    rawX.set(0);
    rawY.set(0);
  };

  if (reducedMotion) {
    return <BauhausArt />;
  }

  return (
    <div
      ref={containerRef}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className="relative"
      style={{ perspective: 1400 }}
    >
      <motion.div
        style={{
          x: translateX,
          y: translateY,
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
      >
        <BauhausArt />
      </motion.div>
    </div>
  );
}
