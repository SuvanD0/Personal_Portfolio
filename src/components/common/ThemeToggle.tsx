import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import React from 'react';

const ThemeToggle = ({ onLightMode }: { onLightMode?: () => void }) => {
  const { theme, toggleTheme } = useTheme();

  const handleClick = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    toggleTheme();
    if (newTheme === 'light' && onLightMode) {
      onLightMode();
    }
  };

  return (
    <button
      onClick={handleClick}
      className="h-8 w-8 rounded-full flex items-center justify-center hover:text-primary transition-all duration-300 ease-in-out"
      aria-label="Toggle theme"
    >
      <div className="relative w-4 h-4">
        <Sun 
          className={`absolute h-4 w-4 transition-all duration-300 ease-in-out ${
            theme === 'dark' ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'
          }`}
        />
        <Moon 
          className={`absolute h-4 w-4 transition-all duration-300 ease-in-out ${
            theme === 'dark' ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'
          }`}
        />
      </div>
    </button>
  );
};

export default ThemeToggle;
