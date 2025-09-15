import React from 'react';
import ThemeSlider from '../components/common/ThemeSlider';
import IconLink from '../components/common/IconLink';
import { Github, Linkedin, Mail, Globe } from 'lucide-react';
import { personalLinks } from '../data/portfolioData';

const iconMap: Record<string, JSX.Element> = {
  'GitHub': <Github className="h-4 w-4" />,
  'LinkedIn': <Linkedin className="h-4 w-4" />,
  'Email': <Mail className="h-4 w-4" />,
  'Portfolio': <Globe className="h-4 w-4" />,
};

const FunLandingPage = () => {
  return (
    <div className="min-h-screen bg-yellow-50" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <header className="py-6 px-6">
        <div className="flex justify-between items-center w-full">
          {/* Large bold title - similar to "garden party" style */}
          <h1 className="text-6xl md:text-8xl font-black text-black lowercase tracking-tight" 
              style={{ 
                fontWeight: 900,
                letterSpacing: '-0.05em',
                fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif'
              }}>
            suvan dommeti
          </h1>
          
          {/* Navigation links and theme toggle in top right */}
          <div className="flex flex-col items-end space-y-4">
            {/* Navigation links - similar to the top nav style */}
            <nav className="flex items-center space-x-8 text-sm font-medium uppercase tracking-wider text-black">
              {personalLinks.slice(0, 3).map(link => (
                <a 
                  key={link.title}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-70 transition-opacity"
                >
                  {link.title}
                </a>
              ))}
            </nav>
            
            {/* Theme toggle */}
            <ThemeSlider />
          </div>
        </div>
      </header>
      
      <main className="flex-grow flex items-center justify-center px-6">
        <div className="text-center text-black">
          <h2 className="text-4xl font-bold mb-4">Coming Soon</h2>
          <p className="text-xl opacity-70">This is where the fun begins...</p>
        </div>
      </main>
    </div>
  );
};

export default FunLandingPage;