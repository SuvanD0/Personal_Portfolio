
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface ProjectCardProps {
  logo?: React.ReactNode;
  title: string;
  description: string;
  year: string;
  link?: string;
  details?: string;
  tags?: string[];
}

const ProjectCard = ({
  logo,
  title,
  description,
  year,
  link,
  details,
  tags
}: ProjectCardProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const headerContent = (
    <div className="flex items-center space-x-4">
      {logo && <div className="w-8 h-8 flex items-center justify-center">
        {logo}
      </div>}
      <div className="flex-1">
        <h3 className="font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="text-sm text-muted-foreground">{year}</div>
    </div>
  );

  return (
    <div className="mb-5 origami-fold border-l border-dashed border-muted pl-4 hover:border-primary transition-colors">
      <div 
        className="py-2 flex justify-between items-center cursor-pointer" 
        onClick={() => setIsOpen(!isOpen)}
      >
        {link ? (
          <a 
            href={link} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="block w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {headerContent}
          </a>
        ) : (
          headerContent
        )}
      </div>
      
      {(details || tags) && (
        <div className={cn("origami-fold-content overflow-hidden transition-all duration-600", 
          isOpen ? "origami-fold-open" : "origami-fold-closed")}>
          <div className="py-4 px-0">
            {details && <p className="text-sm mb-3 text-muted-foreground">{details}</p>}
            
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
      )}
    </div>
  );
};

export default ProjectCard;
