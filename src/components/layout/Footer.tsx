import React from 'react';

const Footer = () => {
  return (
    <footer className="py-6 w-full max-w-3xl mx-auto px-6 border-t border-foreground/25">
      <div className="text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Suvan Dommeti. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer; 