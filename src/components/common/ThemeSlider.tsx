import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import React from 'react';

const ThemeSlider = ({ onLightMode }: { onLightMode?: () => void }) => {
  const { theme, setThemeMode } = useTheme();

  const handleContainerToggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setThemeMode(next);
    if (next === 'light' && onLightMode) {
      onLightMode();
    }
  };

  const containerBg = theme === 'light' ? 'bg-secondary/70' : 'bg-muted/50';

  return (
    <div
      className={`flex items-center rounded-full p-1 space-x-1 ${containerBg}`}
      onClick={handleContainerToggle}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleContainerToggle();
        }
      }}
      aria-label="Toggle color mode"
      aria-pressed={theme === 'dark'}
    >
      <button
        className={`h-7 w-7 rounded-full flex items-center justify-center transition-all duration-300 ease-in-out ${
          theme === 'light' 
            ? 'bg-background shadow-sm text-foreground' 
            : 'hover:text-primary text-muted-foreground hover:bg-muted/80'
        }`}
        aria-label="Light mode"
        >
        <Sun className="h-3.5 w-3.5" />
      </button>
      
      <button
        className={`h-7 w-7 rounded-full flex items-center justify-center transition-all duration-300 ease-in-out ${
          theme === 'dark' 
            ? 'bg-background shadow-sm text-foreground' 
            : 'hover:text-primary text-muted-foreground hover:bg-muted/80'
        }`}
        aria-label="Dark mode"
      >
        <Moon className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};

export default ThemeSlider;
