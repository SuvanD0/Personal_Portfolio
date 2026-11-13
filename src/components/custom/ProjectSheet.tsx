// [F8] Right-side detail sheet for projects (designeer "detail-sheet" pattern).
// The page content behind it gets `.cover-target.is-covered` (dim + blur + 97.5%).
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RoleCardData } from '@/data/portfolioData';
import NudgeArrow from '@/components/common/NudgeArrow';

const EXIT_MS = 180;

interface Props {
  project: RoleCardData | null;
  onClose: () => void;
}

const ProjectSheet = ({ project, onClose }: Props) => {
  // keep the last project around during the exit animation
  const [shown, setShown] = useState<RoleCardData | null>(project);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (project) {
      setShown(project);
      setClosing(false);
    } else if (shown) {
      setClosing(true);
      const t = window.setTimeout(() => { setShown(null); setClosing(false); }, EXIT_MS);
      return () => window.clearTimeout(t);
    }
  }, [project]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!project) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [project, onClose]);

  if (!shown) return null;

  return createPortal(
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={shown.title}>
      <div
        className={cn('absolute inset-0 bg-background/60', closing ? 'scrim-out' : 'scrim-in')}
        onClick={onClose}
      />
      <aside
        data-fb="F8"
        className={cn(
          'absolute right-0 top-0 h-full w-full sm:w-[440px] bg-background border-l border-dashed border-foreground/25 overflow-y-auto',
          'px-6 py-6 flex flex-col gap-5',
          closing ? 'sheet-out' : 'sheet-in'
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {shown.logo && <div className="w-8 h-8 shrink-0 flex items-center justify-center overflow-hidden">{shown.logo}</div>}
            <div className="min-w-0">
              <h3 className="font-body font-semibold text-foreground leading-tight">{shown.title}</h3>
              {shown.description && <p className="text-sm text-muted-foreground">{shown.description}</p>}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="pressable shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/20 transition-colors duration-150 ease-out"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <dl className="text-sm border-y border-dashed border-foreground/20 divide-y divide-dashed divide-foreground/20">
          {shown.year && (
            <div className="flex justify-between py-2">
              <dt className="text-muted-foreground">When</dt>
              <dd className="font-medium">{shown.year}</dd>
            </div>
          )}
          {shown.tags && shown.tags.length > 0 && (
            <div className="flex justify-between py-2 gap-6">
              <dt className="text-muted-foreground shrink-0">Stack</dt>
              <dd className="flex flex-wrap gap-1.5 justify-end">
                {shown.tags.map(tag => (
                  <span key={tag} className="px-2 py-0.5 bg-[hsl(var(--sage-moss-subtle))] text-sage-moss font-medium text-xs rounded-md">
                    {tag}
                  </span>
                ))}
              </dd>
            </div>
          )}
        </dl>

        {shown.details && <p className="text-sm text-muted-foreground leading-relaxed">{shown.details}</p>}

        {shown.link && (
          <a
            href={shown.link}
            target="_blank"
            rel="noopener noreferrer"
            className="group pressable mt-auto inline-flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-foreground/40 px-4 py-2 text-sm font-medium hover:border-primary hover:text-primary transition-colors duration-150 ease-out"
          >
            Visit <NudgeArrow />
          </a>
        )}
      </aside>
    </div>,
    document.body
  );
};

export default ProjectSheet;
