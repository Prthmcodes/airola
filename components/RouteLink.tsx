import React from 'react';
import { Page } from '../types';
import { pathFor } from '../config/routes';

interface RouteLinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  page: Page;
  onNavigate: (page: Page) => void;
  // Optional fragment, e.g. "services" for /#services
  hash?: string;
  // Runs after in-app navigation (close a menu, scroll to a section)
  afterNavigate?: () => void;
}

// A real <a href> so crawlers and "open in new tab" work, with in-app navigation on a plain click.
// Replaces <button onClick={() => onNavigate(...)}> without changing how it looks: buttons default
// to inline-block and centred text, so those are added unless the classes already set them.
const RouteLink: React.FC<RouteLinkProps> = ({ page, onNavigate, hash, afterNavigate, className = '', onClick, children, ...rest }) => {
  const display = /(^|\s)(flex|inline-flex|block|inline-block|inline|grid|hidden)(\s|$)/.test(className) ? '' : 'inline-block ';
  const align = /(^|\s)text-(left|right|center)(\s|$)/.test(className) ? '' : 'text-center ';
  return (
    <a
      {...rest}
      href={pathFor(page) + (hash ? `#${hash}` : '')}
      className={`${display}${align}${className}`.trim()}
      onClick={e => {
        onClick?.(e);
        if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        e.preventDefault();
        onNavigate(page);
        afterNavigate?.();
      }}
    >
      {children}
    </a>
  );
};

export default RouteLink;
