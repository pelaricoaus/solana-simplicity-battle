
import React from 'react';

const Footer = () => {
  return (
    <footer className="mt-auto py-6 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="divider"></div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-4">
          <p className="text-sm text-white/50">
            Built with ❤️ for the Solana Degen community
          </p>
          <div className="flex items-center gap-4">
            <a 
              href="https://github.com/smogon/pokemon-showdown"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-white/50 hover:text-white transition-colors duration-200"
            >
              Source
            </a>
            <a 
              href="https://play.pokemonshowdown.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-white/50 hover:text-white transition-colors duration-200"
            >
              Original
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
