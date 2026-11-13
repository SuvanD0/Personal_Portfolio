// [F3] Internal link that wraps navigation in document.startViewTransition
// so route changes cross-fade (see ::view-transition rules in index.css).
import { Link, LinkProps, useNavigate, To, NavigateOptions } from 'react-router-dom';
import { flushSync } from 'react-dom';
import { MouseEvent } from 'react';

type DocWithVT = Document & { startViewTransition?: (cb: () => void) => unknown };

export function transitionNavigate(fn: () => void) {
  const doc = document as DocWithVT;
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if (typeof doc.startViewTransition === 'function' && !reduced) {
    doc.startViewTransition(() => {
      flushSync(fn);
    });
  } else {
    fn();
  }
}

export function useTNavigate() {
  const navigate = useNavigate();
  return (to: To, opts?: NavigateOptions) => transitionNavigate(() => navigate(to, opts));
}

const TLink = ({ onClick, to, target, replace, state, ...rest }: LinkProps) => {
  const navigate = useNavigate();
  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (
      e.defaultPrevented ||
      e.button !== 0 ||
      (target && target !== '_self') ||
      e.metaKey || e.ctrlKey || e.shiftKey || e.altKey
    ) return;
    e.preventDefault();
    transitionNavigate(() => navigate(to, { replace, state }));
  };
  return <Link to={to} target={target} replace={replace} state={state} {...rest} onClick={handleClick} />;
};

export default TLink;
