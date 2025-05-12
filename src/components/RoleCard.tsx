
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface RoleCardProps {
  logo?: React.ReactNode;
  company: string;
  role: string;
  period: string;
  location?: string;
  description?: string;
  tags?: string[];
}

const RoleCard = ({
  logo,
  company,
  role,
  period,
  location,
  description,
  tags
}: RoleCardProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const headerContent = (
    <div className="flex items-center space-x-4">
      {logo && <div className="w-8 h-8 flex items-center justify-center">
        {logo}
      </div>}
      <div>
        <h3 className="font-semibold text-foreground">{company}</h3>
        <p className="text-sm text-muted-foreground">{role}</p>
      </div>
    </div>
  );

  return (
    <div className="mb-5 origami-fold border-l border-dashed border-muted pl-4 hover:border-primary transition-colors">
      <div 
        className="py-2 flex justify-between items-center cursor-pointer" 
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center space-x-3">
          {headerContent}
        </div>
        <div className="text-right">
          <p className="text-sm">{period}</p>
          {location && <p className="text-xs text-muted-foreground">{location}</p>}
        </div>
      </div>
      
      <div className={cn("origami-fold-content overflow-hidden transition-all duration-600", 
        isOpen ? "origami-fold-open" : "origami-fold-closed")}>
        <div className="py-4 px-0">
          {description && <p className="text-sm mb-3 text-muted-foreground">{description}</p>}
          
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {tags.map(tag => (
                <span key={tag} className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded-sm hover-transition">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoleCard;
