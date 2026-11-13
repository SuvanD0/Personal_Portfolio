// [F5] ↗ that nudges up-right when the parent `.group` is hovered.
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const NudgeArrow = ({ className }: { className?: string }) => (
  <ArrowUpRight
    aria-hidden
    className={cn(
      'h-3.5 w-3.5 shrink-0 transition-transform duration-150 ease-out',
      'group-hover:translate-x-0.5 group-hover:-translate-y-0.5',
      className
    )}
  />
);

export default NudgeArrow;
