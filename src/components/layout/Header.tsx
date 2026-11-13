import { Github, Linkedin, Mail } from 'lucide-react';
import TLink from '../common/TLink';
import ThemeSlider from '../common/ThemeSlider';
import IconLink from '../common/IconLink';
import { personalLinks } from '../../data/portfolioData';

const iconMap: Record<string, JSX.Element> = {
  'GitHub': <Github className="h-4 w-4" />,
  'LinkedIn': <Linkedin className="h-4 w-4" />,
  'Email': <Mail className="h-4 w-4" />,
};

const Header = ({ onLightMode }: { onLightMode?: () => void }) => {
  // [F3] vt-header pins the header during route cross-fades
  return (
    <header className="vt-header py-6 flex justify-between items-center w-full max-w-3xl mx-auto px-6">
      <TLink to="/" className="pressable font-heading text-2xl font-semibold tracking-tight hover:opacity-80 transition-opacity">Suvan Dommeti</TLink>
      
      <div className="flex items-center space-x-3" data-fb="F1">
        {personalLinks.map(link => (
          <IconLink
            key={link.title}
            href={link.url}
            icon={iconMap[link.title] || <Github className="h-4 w-4" />}
            label={link.title}
          />
        ))}
        <ThemeSlider onLightMode={onLightMode} />
      </div>
    </header>
  );
};

export default Header;
