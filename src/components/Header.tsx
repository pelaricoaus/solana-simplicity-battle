
import React from 'react';
import { Bitcoin } from 'lucide-react';

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass py-4 px-6 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img 
            src="/lovable-uploads/4e6c8227-9be0-4f43-8234-b5ba531b9ccf.png" 
            alt="SOLOMON" 
            className="h-10 animate-float" 
          />
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2">
            <Bitcoin className="h-5 w-5 text-degen-yellow" />
            <span className="text-degen-yellow font-medium">DEGEN BATTLES</span>
          </div>
          
          <a 
            href="https://github.com/smogon/pokemon-showdown"
            target="_blank"
            rel="noopener noreferrer" 
            className="text-white/70 hover:text-white transition-colors duration-200"
          >
            GitHub
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;
