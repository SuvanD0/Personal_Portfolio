import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import NudgeArrow from './NudgeArrow';

interface SectionTitleProps {
  title: string;
  className?: string;
  resumeLink?: string;
}

const SectionTitle = ({ title, className, resumeLink }: SectionTitleProps) => {
  return (
    <div className="flex justify-between items-center mb-6 border-b border-foreground/25 pb-2 transition-colors duration-100">
      <h2 className={cn("font-heading text-xl font-semibold text-primary heading", className)}>
        {title}
      </h2>
      {resumeLink && (
        <a href={resumeLink} target="_blank" rel="noopener noreferrer" className="group pressable inline-block" data-fb="F5">
          {/* [F5] arrow nudges up-right on hover */}
          <Button variant="outline" size="sm" className="gap-1 border border-dashed border-foreground/40 hover:border-primary hover:text-primary transition-colors duration-150 ease-out text-xs">
            Resume <NudgeArrow className="h-3 w-3" />
          </Button>
        </a>
      )}
    </div>
  );
};

export default SectionTitle;
