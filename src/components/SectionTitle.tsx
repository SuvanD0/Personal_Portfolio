
import { cn } from '@/lib/utils';
import { Button } from './ui/button';

interface SectionTitleProps {
  title: string;
  className?: string;
  resumeLink?: string;
}

const SectionTitle = ({ title, className, resumeLink }: SectionTitleProps) => {
  return (
    <div className="flex justify-between items-center mb-6 border-b border-muted pb-2">
      <h2 className={cn("text-lg font-semibold text-primary heading", className)}>
        {title}
      </h2>
      {resumeLink && (
        <a href={resumeLink} target="_blank" rel="noopener noreferrer">
          <Button variant="outline" size="sm" className="border border-dashed hover:border-primary hover:text-primary transition-colors text-xs">
            Resume
          </Button>
        </a>
      )}
    </div>
  );
};

export default SectionTitle;
