
import React from 'react';
import { cn } from '@/lib/utils';

interface IconLinkProps {
  href: string;
  icon: React.ReactNode;
  className?: string;
  label: string;
}

const IconLink = ({ href, icon, className, label }: IconLinkProps) => {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "pressable h-8 w-8 rounded-full flex items-center justify-center hover:text-primary transition-colors duration-150 ease-out", // [F1]
        className
      )}
      aria-label={label}
    >
      {icon}
    </a>
  );
};

export default IconLink;
