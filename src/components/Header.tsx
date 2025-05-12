
import { Github, Linkedin, Mail, Twitter } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import IconLink from './IconLink';

const Header = () => {
  return (
    <header className="py-8 flex justify-between items-center w-full max-w-3xl mx-auto px-6">
      <h1 className="text-xl font-semibold tracking-tight">Suvan Dommeti</h1>
      
      <div className="flex items-center space-x-3">
        <IconLink 
          href="https://github.com" 
          icon={<Github className="h-4 w-4" />} 
          label="GitHub"
        />
        <IconLink 
          href="https://linkedin.com" 
          icon={<Linkedin className="h-4 w-4" />} 
          label="LinkedIn"
        />
        <IconLink 
          href="https://twitter.com" 
          icon={<Twitter className="h-4 w-4" />} 
          label="Twitter"
        />
        <IconLink 
          href="mailto:your-email@example.com" 
          icon={<Mail className="h-4 w-4" />} 
          label="Email"
        />
        <ThemeToggle />
      </div>
    </header>
  );
};

export default Header;
