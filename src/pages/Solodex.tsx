
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sword, Shield, Zap, Share2, Search } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getAllSolomons, getSolomonTypes } from '@/data/solomonData';
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const Solodex = () => {
  const allSolomons = getAllSolomons();
  const types = getSolomonTypes();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  
  const filteredSolomons = allSolomons.filter(solomon => {
    const matchesSearch = solomon.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType ? solomon.type.includes(selectedType) : true;
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-black to-degen-gray overflow-x-hidden">
      <Header />
      
      <main className="flex-grow flex flex-col items-center w-full px-4 pt-24 pb-16">
        <div className="max-w-6xl w-full mx-auto">
          <h1 className="text-3xl font-bold text-gradient mb-8 text-center">SOLODEX</h1>
          <p className="text-white/70 text-center mb-10 max-w-2xl mx-auto">
            Comprehensive database of all SOLOMON in the degen universe. 
            Use this information to build your ultimate team.
          </p>
          
          <div className="flex flex-col md:flex-row gap-6 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 h-4 w-4" />
              <Input 
                className="bg-black/30 border-white/10 pl-10" 
                placeholder="Search SOLOMON..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 flex-wrap md:flex-nowrap">
              <Button 
                variant="outline" 
                className={`bg-black/20 border-white/10 text-xs px-3 ${selectedType === null ? 'border-solana/50 text-solana' : ''}`}
                onClick={() => setSelectedType(null)}
              >
                All Types
              </Button>
              
              {types.map(type => (
                <Button 
                  key={type.name}
                  variant="outline" 
                  className={`bg-black/20 border-white/10 text-xs px-3 ${selectedType === type.name ? `border-[${type.color}]/50 text-[${type.color}]` : ''}`}
                  onClick={() => setSelectedType(type.name)}
                >
                  {type.name}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredSolomons.map(solomon => (
              <Card 
                key={solomon.name} 
                className="bg-degen-gray border-white/10 p-4 glass-card hover:bg-degen-gray-light transition-colors"
              >
                <div className="flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-white">{solomon.name}</h3>
                    <div className="flex gap-1">
                      {solomon.type.map(type => {
                        const typeInfo = types.find(t => t.name === type);
                        return (
                          <TooltipProvider key={type}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span 
                                  className="inline-block px-2 py-1 rounded text-xs" 
                                  style={{ backgroundColor: typeInfo?.bgColor, color: typeInfo?.color }}
                                >
                                  {type}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent className="bg-black/80 border-white/10">
                                <p>{typeInfo?.description}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 mb-4">
                    <div className="bg-black/30 rounded-lg p-2">
                      <img 
                        src={solomon.sprite}
                        alt={solomon.name}
                        className="h-16 w-16 object-contain pixelated"
                        style={{ imageRendering: "pixelated" }}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-xs flex-1">
                      <div className="flex items-center gap-1">
                        <Shield className="h-3 w-3 text-degen-blue" />
                        <span>DEF: {solomon.stats.defense}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Zap className="h-3 w-3 text-degen-yellow" />
                        <span>SPD: {solomon.stats.speed}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Sword className="h-3 w-3 text-degen-red" />
                        <span>ATK: {solomon.stats.attack}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Share2 className="h-3 w-3 text-degen-purple" />
                        <span>SPC: {solomon.stats.special}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-sm text-white/80 mb-2">
                    {solomon.description || "A mysterious SOLOMON from the Solana ecosystem."}
                  </div>
                  
                  <div>
                    <h4 className="text-xs text-white/60 mb-1">Moves:</h4>
                    <div className="grid grid-cols-2 gap-1">
                      {solomon.moves.map(move => {
                        const moveType = move.split(':')[1]?.trim() || '';
                        return (
                          <HoverCard key={move}>
                            <HoverCardTrigger asChild>
                              <Button
                                variant="outline"
                                className={`bg-degen-gray-light hover:bg-degen-purple/30 border border-white/5 text-xs justify-start h-auto py-1.5 ${
                                  moveType === 'Pump' ? "hover:text-red-400" :
                                  moveType === 'Liquid' ? "hover:text-blue-400" :
                                  moveType === 'Stake' ? "hover:text-green-400" :
                                  moveType === 'Buzz' ? "hover:text-yellow-400" :
                                  moveType === 'Psychic' ? "hover:text-purple-400" :
                                  moveType === 'Cold' ? "hover:text-cyan-400" :
                                  "hover:text-white"
                                }`}
                                size="sm"
                              >
                                <Zap className={`h-3 w-3 mr-1 flex-shrink-0 ${
                                  moveType === 'Pump' ? "text-red-400" :
                                  moveType === 'Liquid' ? "text-blue-400" :
                                  moveType === 'Stake' ? "text-green-400" :
                                  moveType === 'Buzz' ? "text-yellow-400" :
                                  moveType === 'Psychic' ? "text-purple-400" :
                                  moveType === 'Cold' ? "text-cyan-400" :
                                  "text-degen-yellow"
                                }`} />
                                <span className="truncate">{move.split(':')[0]}</span>
                              </Button>
                            </HoverCardTrigger>
                            <HoverCardContent className="bg-black/90 border-white/10 text-white w-72">
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <h4 className="font-bold">{move.split(':')[0]}</h4>
                                  <span className={`text-xs px-2 py-0.5 rounded ${
                                    moveType === 'Pump' ? "bg-red-900/50 text-red-400" :
                                    moveType === 'Liquid' ? "bg-blue-900/50 text-blue-400" :
                                    moveType === 'Stake' ? "bg-green-900/50 text-green-400" :
                                    moveType === 'Buzz' ? "bg-yellow-900/50 text-yellow-400" :
                                    moveType === 'Psychic' ? "bg-purple-900/50 text-purple-400" :
                                    moveType === 'Cold' ? "bg-cyan-900/50 text-cyan-400" :
                                    "bg-gray-900/50 text-gray-400"
                                  }`}>
                                    {moveType}
                                  </span>
                                </div>
                                <div className="grid grid-cols-2 gap-1 text-xs">
                                  <div>Power: {Math.floor(Math.random() * 50) + 50}</div>
                                  <div>Accuracy: {Math.floor(Math.random() * 30) + 70}%</div>
                                </div>
                                <p className="text-xs text-white/70">
                                  {move.includes("MARKET MANIPULATION") 
                                    ? "A powerful move that manipulates the market, dealing high damage to the opponent."
                                    : move.includes("VIRAL TWEET") 
                                      ? "Spreads like wildfire on social media, dealing moderate damage with high accuracy."
                                      : move.includes("MOON SHOT") 
                                        ? "Launches a powerful attack that can send prices to the moon, dealing massive damage."
                                        : move.includes("MARKET RECOVERY") 
                                          ? "Recovers from a market downturn, restoring HP and boosting defense."
                                          : "A standard move with balanced power and accuracy."}
                                </p>
                              </div>
                            </HoverCardContent>
                          </HoverCard>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          
          {filteredSolomons.length === 0 && (
            <div className="text-center py-12">
              <p className="text-white/70">No SOLOMON found matching your criteria.</p>
              <Button 
                variant="outline"
                className="mt-4 bg-black/30 border-white/10"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedType(null);
                }}
              >
                Reset Filters
              </Button>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Solodex;
