// Dev-only review overlay (mounted when import.meta.env.DEV).
// Draws a numbered badge at every [data-fb] element, collects comments per
// change in one panel, and copies them as markdown.
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CHANGES } from './changes';

const LS_KEY = 'fb-comments-v1';
type Comments = Record<string, string>;

interface Pos { id: string; x: number; y: number }

function load(): Comments {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}'); } catch { return {}; }
}

const FeedbackOverlay = () => {
  const [open, setOpen] = useState(false);
  const [showBadges, setShowBadges] = useState(true);
  const [comments, setComments] = useState<Comments>(load);
  const [positions, setPositions] = useState<Pos[]>([]);
  const [focusId, setFocusId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // persist
  useEffect(() => { try { localStorage.setItem(LS_KEY, JSON.stringify(comments)); } catch { /* noop */ } }, [comments]);

  // badge positions: first element per id, refreshed on scroll/resize/DOM change
  const measure = useCallback(() => {
    const seen = new Set<string>();
    const next: Pos[] = [];
    document.querySelectorAll<HTMLElement>('[data-fb]').forEach(el => {
      const id = el.dataset.fb!;
      if (seen.has(id)) return;
      const r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) return;
      seen.add(id);
      next.push({ id, x: r.left, y: r.top });
    });
    setPositions(next);
  }, []);

  useEffect(() => {
    let raf = 0;
    const schedule = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(measure); };
    schedule();
    window.addEventListener('scroll', schedule, true);
    window.addEventListener('resize', schedule);
    const mo = new MutationObserver(schedule);
    mo.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style'] });
    const iv = window.setInterval(schedule, 600);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', schedule, true);
      window.removeEventListener('resize', schedule);
      mo.disconnect();
      window.clearInterval(iv);
    };
  }, [measure]);

  // focus textarea when a badge is clicked
  useEffect(() => {
    if (!open || !focusId) return;
    const ta = panelRef.current?.querySelector<HTMLTextAreaElement>(`textarea[data-id="${focusId}"]`);
    ta?.focus();
    ta?.scrollIntoView({ block: 'center' });
  }, [open, focusId]);

  const setComment = (id: string, v: string) => setComments(c => ({ ...c, [id]: v }));

  const toMarkdown = () => {
    const lines = ['## Feedback — dev/designeer-motion', ''];
    if (comments.__overall?.trim()) lines.push(`**Overall:** ${comments.__overall.trim()}`, '');
    for (const ch of CHANGES) {
      const c = comments[ch.id]?.trim();
      if (c) lines.push(`- [${ch.id}] ${ch.title}: ${c}`);
    }
    return lines.join('\n');
  };

  const copy = async () => {
    const md = toMarkdown();
    try { await navigator.clipboard.writeText(md); } catch {
      const ta = document.createElement('textarea'); ta.value = md; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove();
    }
    setCopied(true); window.setTimeout(() => setCopied(false), 1200);
  };

  const clear = () => { if (window.confirm('Clear all feedback comments?')) setComments({}); };

  const count = CHANGES.filter(c => comments[c.id]?.trim()).length + (comments.__overall?.trim() ? 1 : 0);

  const badge = (id: string, hasComment: boolean, onClick?: () => void) => (
    <span
      onClick={onClick}
      className={`inline-flex items-center justify-center h-[18px] min-w-[26px] px-1 rounded-full text-[10px] font-bold font-mono leading-none select-none ${onClick ? 'cursor-pointer' : ''}`}
      style={{ background: hasComment ? '#B96E89' : 'hsl(var(--sage-moss))', color: '#fff', boxShadow: '0 0 0 2px hsl(var(--background))' }}
    >
      {id}
    </span>
  );

  return createPortal(
    <>
      {/* badges */}
      {showBadges && positions.map(p => (
        <div
          key={p.id}
          title={CHANGES.find(c => c.id === p.id)?.title}
          style={{ position: 'fixed', left: Math.max(2, p.x - 12), top: Math.max(2, p.y - 14), zIndex: 9998, pointerEvents: 'auto', opacity: 0.92 }}
        >
          {badge(p.id, Boolean(comments[p.id]?.trim()), () => { setFocusId(p.id); setOpen(true); })}
        </div>
      ))}

      {/* toggle */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{ position: 'fixed', right: 16, bottom: 16, zIndex: 9999 }}
        className="pressable h-9 px-3 rounded-full bg-foreground text-background text-xs font-semibold shadow-lg flex items-center gap-2"
      >
        <span>Feedback</span>
        {count > 0 && <span className="h-5 min-w-5 px-1 rounded-full bg-[#B96E89] text-white text-[10px] flex items-center justify-center">{count}</span>}
      </button>

      {/* panel */}
      {open && (
        <div
          ref={panelRef}
          style={{ position: 'fixed', right: 16, bottom: 60, zIndex: 9999, width: 'min(380px, calc(100vw - 32px))', maxHeight: '72vh' }}
          className="popup-in flex flex-col rounded-xl border border-dashed border-foreground/30 bg-background shadow-2xl text-foreground"
        >
          <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-dashed border-foreground/20">
            <div className="text-xs font-semibold">Review · dev/designeer-motion</div>
            <div className="flex items-center gap-1">
              <label className="text-[10px] text-muted-foreground flex items-center gap-1 mr-1 cursor-pointer">
                <input type="checkbox" checked={showBadges} onChange={e => setShowBadges(e.target.checked)} /> badges
              </label>
              <button type="button" onClick={clear} className="pressable text-[10px] px-2 h-6 rounded-md hover:bg-muted/20">Clear</button>
              <button type="button" onClick={copy} className="pressable text-[10px] px-2 h-6 rounded-md bg-foreground text-background font-semibold">
                {copied ? 'Copied ✓' : 'Copy all'}
              </button>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="pressable text-xs w-6 h-6 rounded-md hover:bg-muted/20">×</button>
            </div>
          </div>

          <div className="overflow-y-auto px-3 py-2 space-y-3">
            <div>
              <div className="text-[11px] font-semibold mb-1">Overall</div>
              <textarea
                data-id="__overall"
                rows={2}
                value={comments.__overall ?? ''}
                onChange={e => setComment('__overall', e.target.value)}
                placeholder="General impression…"
                className="w-full text-xs rounded-md border border-foreground/20 bg-transparent px-2 py-1.5 focus:outline-none focus:border-sage-moss resize-y"
              />
            </div>
            {CHANGES.map(ch => {
              const located = positions.some(p => p.id === ch.id);
              return (
                <div key={ch.id}>
                  <div className="flex items-center gap-2 mb-1">
                    {badge(ch.id, Boolean(comments[ch.id]?.trim()), located ? () => {
                      document.querySelector<HTMLElement>(`[data-fb="${ch.id}"]`)?.scrollIntoView({ block: 'center', behavior: 'smooth' });
                    } : undefined)}
                    <div className="min-w-0">
                      <div className="text-[11px] font-semibold leading-tight">{ch.title}</div>
                      <div className="text-[10px] text-muted-foreground leading-tight">{ch.where}{located ? '' : ' · not on this page'}</div>
                    </div>
                  </div>
                  {ch.note && <div className="text-[10px] text-muted-foreground mb-1 pl-8">{ch.note}</div>}
                  <textarea
                    data-id={ch.id}
                    rows={2}
                    value={comments[ch.id] ?? ''}
                    onChange={e => setComment(ch.id, e.target.value)}
                    placeholder="Comment…"
                    className="w-full text-xs rounded-md border border-foreground/20 bg-transparent px-2 py-1.5 focus:outline-none focus:border-sage-moss resize-y"
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>,
    document.body
  );
};

export default FeedbackOverlay;
