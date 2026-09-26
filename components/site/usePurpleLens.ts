'use client';
import { useEffect, useRef, useState } from 'react';
import { attachPurpleLens, type LensPhase } from '@/lib/purple-lens-controller';

export function usePurpleLens() {
  const heroRef = useRef<HTMLElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const [phase, setPhase] = useState<LensPhase>('exploring');
  useEffect(() => {
    const hero = heroRef.current, button = buttonRef.current;
    if (!hero || !button) return;
    return attachPurpleLens(hero, button, labelRef.current, setPhase);
  }, []);
  return { heroRef, buttonRef, labelRef, phase };
}
