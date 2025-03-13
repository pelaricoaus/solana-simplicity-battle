
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Gamepad, Sword, Diamond } from 'lucide-react';
import TeamBuilder from '@/components/TeamBuilder';
import BattleSimulator from '@/components/BattleSimulator';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useIsMobile } from '@/hooks/use-mobile';

const Index = () => {
  const [team, setTeam] = useState<string[]>([]);
  const [mode, setMode] = useState<'home' | 'team' | 'battle'>('home');
  const isMobile = useIsMobile();

  const handleCreateTeam = (newTeam: string[]) => {
    setTeam(newTeam);
    setMode('battle');
  };

  const handleReset = () => {
    setTeam([]);
    setMode('home');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-black to-degen-gray overflow-x-hidden">
      <Header />
      
      <main className="flex-grow flex flex-col items-center justify-center w-full px-4 pt-24 pb-16">
        {mode === 'home' && (
          <div className="max-w-4xl w-full mx-auto text-center space-y-10 fade-in">
            <div className="space-y-4">
              <div className="inline-block animate-float">
                <img 
                  src="/lovable-uploads/4e6c8227-9be0-4f43-8234-b5ba531b9ccf.png" 
                  alt="SOLOMON" 
                  className="h-28 mx-auto"
                />
              </div>
              <p className="text-lg text-white/70 max-w-2xl mx-auto">
                A minimal battle simulator for the Solana degen community.
                Build your team and start battling in just a few clicks.
              </p>
            </div>
            
            <div 
              className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto"
            >
              <Button
                onClick={() => setMode('team')}
                className="glass-card shadow-lg bg-black/40 border-solana/20 hover:bg-black/50 hover:border-solana/40 h-24 gap-3 group transition-all duration-300 btn-glow"
              >
                <Gamepad className="h-8 w-8 text-solana group-hover:scale-110 transition-transform duration-300" />
                <div className="flex flex-col items-start">
                  <span className="text-lg font-bold text-white">Make a Team</span>
                  <span className="text-sm text-white/70">Build your dream lineup</span>
                </div>
              </Button>
              
              <Button
                onClick={() => {
                  // Use a default team if the user wants to skip team building
                  setTeam(["BONK"]);
                  setMode('battle');
                }}
                className="glass-card shadow-lg bg-black/40 border-degen-purple/20 hover:bg-black/50 hover:border-degen-purple/40 h-24 gap-3 group transition-all duration-300 btn-glow"
              >
                <Sword className="h-8 w-8 text-degen-purple group-hover:scale-110 transition-transform duration-300" />
                <div className="flex flex-col items-start">
                  <span className="text-lg font-bold text-white">Quick Battle</span>
                  <span className="text-sm text-white/70">Use default team</span>
                </div>
              </Button>
            </div>
            
            <div className="pt-10 divider"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="glass p-6 rounded-xl slide-up stagger-1">
                <Diamond className="h-10 w-10 mx-auto mb-4 text-degen-yellow" />
                <h3 className="text-lg font-medium mb-2">Simple UI</h3>
                <p className="text-sm text-white/70">
                  Clean and minimal interface for an intuitive experience
                </p>
              </div>
              
              <div className="glass p-6 rounded-xl slide-up stagger-2">
                <Gamepad className="h-10 w-10 mx-auto mb-4 text-degen-pink" />
                <h3 className="text-lg font-medium mb-2">Single Battles</h3>
                <p className="text-sm text-white/70">
                  Classic 1v1 SOLOMON battles with strategic gameplay
                </p>
              </div>
              
              <div className="glass p-6 rounded-xl slide-up stagger-3">
                <Sword className="h-10 w-10 mx-auto mb-4 text-degen-blue" />
                <h3 className="text-lg font-medium mb-2">Trading Charts</h3>
                <p className="text-sm text-white/70">
                  Battle with crypto price charts in the background
                </p>
              </div>
            </div>
          </div>
        )}
        
        {mode === 'team' && (
          <TeamBuilder onTeamCreate={handleCreateTeam} />
        )}
        
        {mode === 'battle' && team.length > 0 && (
          <BattleSimulator team={team} onReset={handleReset} />
        )}
        
        {mode !== 'home' && (
          <Button
            onClick={handleReset}
            variant="outline"
            className="mt-8 bg-black/20 border-white/10 hover:bg-black/40"
          >
            Return to Home
          </Button>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
