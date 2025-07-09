import DotGrid from '../components/DotGrid';
import NotFoundImg from '../assets/404NotFound.png';
import { useTheme } from '../hooks/useTheme';
import { useEffect, useState } from 'react';

const getForegroundColor = () => {
  if (typeof window === 'undefined') return '#222';
  const root = document.documentElement;
  const style = getComputedStyle(root);
  const fg = style.getPropertyValue('--foreground');
  // Convert HSL to CSS string if needed
  return fg.includes('%') ? `hsl(${fg})` : fg || '#222';
};

const NotFound = () => {
  const { theme } = useTheme();
  const [foreground, setForeground] = useState('#222');

  useEffect(() => {
    setForeground(getForegroundColor());
  }, [theme]);

  return (
    <div className="fixed inset-0 w-full h-full bg-background text-foreground overflow-hidden flex items-center justify-center">
      {/* DotGrid fills the background */}
      <div className="absolute inset-0 z-0">
        <DotGrid
          dotSize={12}
          gap={28}
          baseColor={foreground}
          activeColor={foreground}
          proximity={120}
          speedTrigger={100}
          shockRadius={200}
          shockStrength={5}
          maxSpeed={5000}
          resistance={750}
          returnDuration={1.5}
        />
      </div>
      {/* 404 image centered and masked out from the grid */}
      <div
        className="relative z-10 flex items-center justify-center"
        style={{
          width: 'min(80vw, 600px)',
          height: 'auto',
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        <img
          src={NotFoundImg}
          alt="404 Not Found"
          style={{
            width: '100%',
            height: 'auto',
            display: 'block',
            filter: theme === 'light' ? 'brightness(0.2) saturate(0)' : 'none',
            opacity: 0.95,
          }}
        />
      </div>
    </div>
  );
};

export default NotFound;
