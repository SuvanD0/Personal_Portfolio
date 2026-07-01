import { useEffect, useRef } from 'react';
import { animate } from 'animejs';

interface CountUpProps {
  value: number | null;
  decimals?: number;
  duration?: number;
  className?: string;
  /** Suffix shown after the number (e.g. "%", "ms"). */
  suffix?: string;
  /** Optional formatter — overrides default decimals formatting. */
  format?: (n: number) => string;
}

/** Subtle number countup on mount and on value change. */
export default function CountUp({
  value,
  decimals = 0,
  duration = 900,
  className,
  suffix,
  format,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const prev = useRef<number>(0);

  useEffect(() => {
    if (value == null || !ref.current) return;
    const el = ref.current;
    const target = value;
    const start = prev.current;
    const proxy = { n: start };

    const fmt = (n: number) => (format ? format(n) : n.toFixed(decimals));

    const anim = animate(proxy, {
      n: target,
      duration,
      ease: 'outExpo',
      onUpdate: () => {
        el.textContent = fmt(proxy.n) + (suffix ?? '');
      },
    });

    prev.current = target;
    return () => anim.pause();
  }, [value, decimals, duration, suffix, format]);

  if (value == null) {
    return <span className={className}>—{suffix ?? ''}</span>;
  }

  return <span ref={ref} className={className}>0{suffix ?? ''}</span>;
}
