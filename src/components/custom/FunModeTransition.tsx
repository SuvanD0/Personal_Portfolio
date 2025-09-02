import React, { useState, useEffect } from 'react';
import { Sparkles, Palette, Wand2 } from 'lucide-react';

interface FunModeTransitionProps {
  show: boolean;
  onComplete: () => void;
}

const FunModeTransition: React.FC<FunModeTransitionProps> = ({ show, onComplete }) => {
  const [stage, setStage] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (show) {
      setMounted(true);
      setStage(0);
      
      const timer1 = setTimeout(() => setStage(1), 200);
      const timer2 = setTimeout(() => setStage(2), 800);
      const timer3 = setTimeout(() => setStage(3), 1400);
      const timer4 = setTimeout(() => {
        onComplete();
        setMounted(false);
      }, 2000);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
        clearTimeout(timer4);
      };
    }
  }, [show, onComplete]);

  if (!mounted) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-500 ${
      stage >= 1 ? 'bg-gradient-to-br from-purple-900 via-pink-900 to-indigo-900' : 'bg-transparent'
    }`}>
      <div className="relative">
        {/* Main sparkle effect */}
        <div className={`transition-all duration-700 ${
          stage >= 1 ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
        }`}>
          <Sparkles className="h-16 w-16 text-white animate-spin" style={{
            filter: 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.5))'
          }} />
        </div>

        {/* Orbiting icons */}
        <div className={`absolute inset-0 transition-all duration-1000 ${
          stage >= 2 ? 'opacity-100' : 'opacity-0'
        }`}>
          <Palette className="absolute h-8 w-8 text-pink-300 animate-bounce" 
                   style={{ 
                     top: '-20px', 
                     left: '-20px',
                     animationDelay: '0.2s',
                     filter: 'drop-shadow(0 0 10px rgba(244, 114, 182, 0.5))'
                   }} />
          <Wand2 className="absolute h-8 w-8 text-purple-300 animate-bounce" 
                 style={{ 
                   bottom: '-20px', 
                   right: '-20px',
                   animationDelay: '0.4s',
                   filter: 'drop-shadow(0 0 10px rgba(196, 181, 253, 0.5))'
                 }} />
        </div>

        {/* Text */}
        <div className={`absolute top-24 left-1/2 transform -translate-x-1/2 transition-all duration-500 ${
          stage >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <p className="text-white text-xl font-medium text-center whitespace-nowrap">
            Entering Fun Mode...
          </p>
          <div className="mt-2 flex justify-center space-x-1">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FunModeTransition;