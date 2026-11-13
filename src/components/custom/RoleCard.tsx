import { useState, CSSProperties } from 'react';
import { ChevronRight } from 'lucide-react';
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
  className?: string;
  style?: CSSProperties;
  'data-fb'?: string;
}

const RoleCard = ({
  logo,
  title,
  company,
  role,
  year,
  period,
  location,
  description,
  details,
  tags,
  className,
  style,
  'data-fb': dataFb,
}: RoleCardProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const headerContent = (
    <div className="flex items-center space-x-4">
      {logo && <div className="w-8 h-8 flex items-center justify-center overflow-hidden">{logo}</div>}
      <div>
        {company && <h3 className="font-body font-semibold text-foreground">{company}</h3>}
        {title && <h3 className="font-body font-semibold text-foreground">{title}</h3>}
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

  const hasBody = (description && role) || details || (tags && tags.length > 0);

  return (
    <div className={cn('mb-3 rounded-xl bg-background', className)} style={style} data-fb={dataFb}>
      {/* [F1] pressable: squashes to 98.5% on :active. [F4] chevron uses the drawer curve. */}
      <button
        type="button"
        aria-expanded={isOpen}
        className="group pressable w-full text-left p-4 flex justify-between items-center cursor-pointer hover:bg-muted/20 transition-colors duration-150 ease-out rounded-xl"
        style={{ '--press': 0.985 } as CSSProperties}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center space-x-3">{headerContent}</div>
        <div className="flex items-center space-x-3">
          {rightContent}
          <div className="ml-2">
            {/* [F5] nudge on hover; [F4] rotate on open */}
            <ChevronRight
              className={cn(
                'w-4 h-4 text-muted-foreground transition-transform duration-300 ease-drawer',
                isOpen ? 'rotate-90' : 'rotate-0 group-hover:translate-x-0.5'
              )}
            />
          </div>
        </div>
      </button>

      {/* [F4] grid-rows 0fr→1fr expand (no max-height guess), content slides down 6px */}
      {hasBody ? (
        <div
          className="grid transition-[grid-template-rows] duration-300 ease-drawer"
          style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
          aria-hidden={!isOpen}
        >
          <div className="min-h-0 overflow-hidden">
            <div
              className={cn(
                'px-4 pb-4 transition-[opacity,transform] duration-300 ease-drawer',
                isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1.5'
              )}
            >
              {description && role && <p className="text-sm mb-3 text-muted-foreground leading-relaxed">{description}</p>}
              {details && <p className="text-sm mb-3 text-muted-foreground leading-relaxed">{details}</p>}
              {tags && tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {tags.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-[hsl(var(--sage-moss-subtle))] text-sage-moss font-medium text-xs rounded-md hover:opacity-80 transition-opacity duration-150 ease-out">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default RoleCard;
