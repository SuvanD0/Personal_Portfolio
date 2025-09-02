import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface RoleCardProps {
  logo?: React.ReactNode;
  title?: string; // For projects
  company?: string; // For work
  role?: string; // For work
  year?: string; // For projects
  period?: string; // For work
  link?: string; // For projects
  location?: string;
  description?: string;
  details?: string; // For projects
  tags?: string[];
}

const RoleCard = ({
  logo,
  title,
  company,
  role,
  year,
  period,
  link,
  location,
  description,
  details,
  tags
}: RoleCardProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [description, details, tags]);

  const headerContent = (
    <div className="flex items-center space-x-4">
      {logo && <div className="w-8 h-8 flex items-center justify-center overflow-hidden">{logo}</div>}
      <div>
        {company && <h3 className="font-semibold text-foreground">{company}</h3>}
        {title && <h3 className="font-semibold text-foreground">{title}</h3>}
        {role && <p className="text-sm text-muted-foreground">{role}</p>}
        {description && !role && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
    </div>
  );

  const rightContent = (
    <div className="text-right">
      {period && <p className="text-sm">{period}</p>}
      {year && <p className="text-sm">{year}</p>}
      {location && <p className="text-xs text-muted-foreground">{location}</p>}
    </div>
  );

  return (
    <div className="mb-3 rounded-lg transition-colors duration-300 bg-card">
      <div 
        className="p-4 flex justify-between items-center cursor-pointer hover:bg-muted/20 transition-colors duration-200 rounded-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center space-x-3">
          {headerContent}
        </div>
        <div className="flex items-center space-x-3">
          {rightContent}
          <div className="ml-2">
            <svg 
              className={cn("w-4 h-4 transition-transform duration-300 text-muted-foreground", 
                isOpen ? "rotate-180" : "rotate-0"
              )} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>
      <div 
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{
          maxHeight: isOpen ? `${contentHeight}px` : '0px',
          opacity: isOpen ? 1 : 0
        }}
      >
        {(description && role) || details || (tags && tags.length > 0) ? (
          <div ref={contentRef} className="px-4 pb-4">
            {description && role && <p className="text-sm mb-3 text-muted-foreground leading-relaxed">{description}</p>}
            {details && <p className="text-sm mb-3 text-muted-foreground leading-relaxed">{details}</p>}
            {tags && tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {tags.map(tag => (
                  <span key={tag} className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded-sm hover:bg-secondary/80 transition-colors duration-200">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default RoleCard;
