
import { ExternalLink } from 'lucide-react';

interface LinkCardProps {
  title: string;
  description: string;
  url: string;
}

const LinkCard = ({ title, description, url }: LinkCardProps) => {
  return (
    <a 
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block mb-5 py-2 border-l border-dashed border-muted pl-4 hover:border-primary transition-colors hover-float group"
    >
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">{title}</h3>
        <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors duration-400" />
      </div>
      <p className="text-sm text-muted-foreground mt-1">{description}</p>
    </a>
  );
};

export default LinkCard;
