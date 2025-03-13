
import React from 'react';
import { Diamond, Bitcoin } from 'lucide-react';

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass py-4 px-6 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Diamond className="h-6 w-6 text-solana animate-glow" />
          <h1 className="text-xl font-bold tracking-tight text-gradient">
            Solana Simplicity Battle
          </h1>
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
