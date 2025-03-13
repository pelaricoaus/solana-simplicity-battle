
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Zap, Shield, Sword, RotateCcw, Play, Share2, BookOpen } from 'lucide-react';

interface Pokemon {
  name: string;
  hp: number;
  maxHp: number;
  moves: string[];
}

interface BattleSimulatorProps {
  team: string[];
  onReset: () => void;
}

const SAMPLE_MOVES = [
  "Tackle", "Quick Attack", "Thunderbolt", "Flamethrower", 
  "Hydro Pump", "Solar Beam", "Psychic", "Earthquake",
  "Ice Beam", "Hyper Beam", "Blizzard", "Fire Blast"
];

// Generate random moves for a Pokémon
const getRandomMoves = () => {
  const shuffled = [...SAMPLE_MOVES].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 4);
};

// Convert a Pokémon name to a full Pokémon object
const createPokemon = (name: string): Pokemon => {
  return {
    name,
    hp: 100,
    maxHp: 100,
    moves: getRandomMoves()
  };
};

const BattleSimulator = ({ team, onReset }: BattleSimulatorProps) => {
  const [playerPokemon, setPlayerPokemon] = useState<Pokemon | null>(null);
  const [opponentPokemon, setOpponentPokemon] = useState<Pokemon | null>(null);
  const [battleLog, setBattleLog] = useState<string[]>(["Battle started! Choose your move."]);
  const [isBattleOver, setIsBattleOver] = useState(false);
  const [playerTeam, setPlayerTeam] = useState<Pokemon[]>([]);
  const [opponentTeam, setOpponentTeam] = useState<Pokemon[]>([]);
  const [turn, setTurn] = useState<"player" | "opponent">("player");
  const [isAnimating, setIsAnimating] = useState(false);
  const { toast } = useToast();

  // Initialize teams and first Pokémon
  useEffect(() => {
    // Create player team from the provided team names
    const newPlayerTeam = team.map(createPokemon);
    setPlayerTeam(newPlayerTeam);
    setPlayerPokemon(newPlayerTeam[0]);

    // Create a random opponent team
    const opponentPool = ["Venusaur", "Charizard", "Blastoise", "Pikachu", "Jigglypuff", 
                        "Gengar", "Gyarados", "Dragonite", "Mewtwo", "Snorlax"]
                        .filter(p => !team.includes(p));
    const opponentTeamSize = Math.min(team.length, opponentPool.length);
    const shuffled = [...opponentPool].sort(() => 0.5 - Math.random());
    const selectedOpponents = shuffled.slice(0, opponentTeamSize);
    
    const newOpponentTeam = selectedOpponents.map(createPokemon);
    setOpponentTeam(newOpponentTeam);
    setOpponentPokemon(newOpponentTeam[0]);
    
    setBattleLog([`Battle started! ${newPlayerTeam[0].name} vs ${newOpponentTeam[0].name}`]);
  }, [team]);

  const performMove = (moveName: string) => {
    if (isBattleOver || isAnimating || !playerPokemon || !opponentPokemon) return;
    
    setIsAnimating(true);
    
    // Player's turn
    if (turn === "player") {
      const damage = Math.floor(Math.random() * 30) + 10;
      const newOpponentHp = Math.max(0, opponentPokemon.hp - damage);
      
      setTimeout(() => {
        setBattleLog(prev => [...prev, `${playerPokemon.name} used ${moveName}! Dealt ${damage} damage.`]);
        
        setOpponentPokemon({
          ...opponentPokemon,
          hp: newOpponentHp
        });
        
        // Check if opponent fainted
        if (newOpponentHp === 0) {
          const remainingOpponents = opponentTeam.filter(p => p.name !== opponentPokemon.name && p.hp > 0);
          
          if (remainingOpponents.length > 0) {
            // Send in next opponent Pokémon
            const nextOpponent = remainingOpponents[0];
            setTimeout(() => {
              setBattleLog(prev => [...prev, `${opponentPokemon.name} fainted! Opponent sent in ${nextOpponent.name}!`]);
              setOpponentPokemon(nextOpponent);
              setIsAnimating(false);
            }, 1000);
          } else {
            // Victory
            setTimeout(() => {
              setBattleLog(prev => [...prev, `${opponentPokemon.name} fainted! You win the battle!`]);
              setIsBattleOver(true);
              setIsAnimating(false);
              toast({
                title: "Victory!",
                description: "You won the battle! Congrats, degen!",
              });
            }, 1000);
          }
        } else {
          // Opponent's turn
          setTurn("opponent");
          setTimeout(() => {
            opponentTurn();
          }, 1000);
        }
      }, 500);
    }
  };

  const opponentTurn = () => {
    if (!playerPokemon || !opponentPokemon) return;
    
    const opponentMove = opponentPokemon.moves[Math.floor(Math.random() * opponentPokemon.moves.length)];
    const damage = Math.floor(Math.random() * 25) + 5;
    const newPlayerHp = Math.max(0, playerPokemon.hp - damage);
    
    setBattleLog(prev => [...prev, `${opponentPokemon.name} used ${opponentMove}! Dealt ${damage} damage.`]);
    
    setPlayerPokemon({
      ...playerPokemon,
      hp: newPlayerHp
    });
    
    // Check if player's Pokémon fainted
    if (newPlayerHp === 0) {
      const remainingPokemon = playerTeam.filter(p => p.name !== playerPokemon.name && p.hp > 0);
      
      if (remainingPokemon.length > 0) {
        // Prompt to choose next Pokémon
        setTimeout(() => {
          setBattleLog(prev => [...prev, `${playerPokemon.name} fainted! Choose your next Pokémon!`]);
          setPlayerPokemon(remainingPokemon[0]);
          setTurn("player");
          setIsAnimating(false);
        }, 1000);
      } else {
        // Defeat
        setTimeout(() => {
          setBattleLog(prev => [...prev, `${playerPokemon.name} fainted! You lost the battle!`]);
          setIsBattleOver(true);
          setIsAnimating(false);
          toast({
            title: "Defeat",
            description: "You lost the battle. Try again!",
            variant: "destructive",
          });
        }, 1000);
      }
    } else {
      // Back to player's turn
      setTurn("player");
      setIsAnimating(false);
    }
  };

  const resetBattle = () => {
    onReset();
    toast({
      title: "Battle Reset",
      description: "Ready to build a new team!",
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto glass-card rounded-xl p-5 fade-in">
      <div className="flex items-center gap-2 mb-6">
        <Sword className="h-5 w-5 text-solana" />
        <h2 className="text-xl font-bold text-gradient">Gen1 Battle Simulator</h2>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Player's Pokémon */}
        <Card className="col-span-1 bg-degen-gray border-white/10 p-4 glass-card slide-in stagger-1">
          {playerPokemon && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-solana">{playerPokemon.name}</h3>
                <span className="text-xs text-white/60">Your Pokémon</span>
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>HP</span>
                  <span>{playerPokemon.hp}/{playerPokemon.maxHp}</span>
                </div>
                <Progress 
                  value={(playerPokemon.hp / playerPokemon.maxHp) * 100} 
                  className="h-2 bg-white/10" 
                  indicatorClassName="bg-gradient-to-r from-degen-green to-solana" 
                />
              </div>
              
              <div className="pt-2">
                <h4 className="text-sm text-white/70 mb-2">Moves:</h4>
                <div className="grid grid-cols-2 gap-2">
                  {playerPokemon.moves.map((move) => (
                    <Button
                      key={move}
                      onClick={() => performMove(move)}
                      disabled={turn !== "player" || isBattleOver || isAnimating}
                      className="bg-degen-gray-light hover:bg-degen-purple/30 border border-white/5 text-sm"
                      size="sm"
                    >
                      <Zap className="h-3 w-3 mr-1 text-degen-yellow" />
                      {move}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Card>
        
        {/* Battle Log */}
        <Card className="col-span-1 bg-black/30 border-white/10 p-4 glass-card slide-up stagger-2">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="h-4 w-4 text-white/70" />
            <h3 className="text-sm font-medium text-white/70">Battle Log</h3>
          </div>
          
          <div className="h-48 overflow-y-auto scrollbar-none space-y-2 text-sm">
            {battleLog.map((log, index) => (
              <div 
                key={index} 
                className={`p-2 rounded-md ${index % 2 === 0 ? 'bg-degen-gray' : 'bg-black/20'}`}
              >
                {log}
              </div>
            ))}
          </div>
          
          <div className="mt-4 flex justify-center">
            {isBattleOver ? (
              <Button
                onClick={resetBattle}
                className="bg-gradient-to-r from-degen-blue to-degen-purple hover:opacity-90"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                New Battle
              </Button>
            ) : (
              <div className="flex items-center justify-center w-full">
                <Button
                  variant="outline"
                  disabled={turn !== "player" || isAnimating}
                  className="bg-degen-gray/50 border-degen-yellow/30 text-degen-yellow hover:bg-degen-yellow/20"
                >
                  <Play className="h-4 w-4 mr-1" />
                  {turn === "player" 
                    ? isAnimating ? "Attacking..." : "Your Turn" 
                    : "Opponent's Turn"}
                </Button>
              </div>
            )}
          </div>
        </Card>
        
        {/* Opponent's Pokémon */}
        <Card className="col-span-1 bg-degen-gray border-white/10 p-4 glass-card slide-in stagger-3" style={{ animationDirection: 'reverse' }}>
          {opponentPokemon && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-degen-pink">{opponentPokemon.name}</h3>
                <span className="text-xs text-white/60">Opponent</span>
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>HP</span>
                  <span>{opponentPokemon.hp}/{opponentPokemon.maxHp}</span>
                </div>
                <Progress 
                  value={(opponentPokemon.hp / opponentPokemon.maxHp) * 100} 
                  className="h-2 bg-white/10" 
                  indicatorClassName="bg-gradient-to-r from-degen-red to-degen-pink" 
                />
              </div>
              
              <div className="pt-2">
                <h4 className="text-sm text-white/70 mb-2">Stats:</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2 bg-black/20 rounded-md p-2">
                    <Shield className="h-4 w-4 text-degen-blue" />
                    <span className="text-xs">Defense: High</span>
                  </div>
                  <div className="flex items-center gap-2 bg-black/20 rounded-md p-2">
                    <Zap className="h-4 w-4 text-degen-yellow" />
                    <span className="text-xs">Speed: Medium</span>
                  </div>
                  <div className="flex items-center gap-2 bg-black/20 rounded-md p-2">
                    <Sword className="h-4 w-4 text-degen-red" />
                    <span className="text-xs">Attack: High</span>
                  </div>
                  <div className="flex items-center gap-2 bg-black/20 rounded-md p-2">
                    <Share2 className="h-4 w-4 text-degen-purple" />
                    <span className="text-xs">Special: Medium</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
      
      {/* Team Status */}
      <Card className="bg-black/20 border-white/10 p-4 glass-card slide-up stagger-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-white/70">Team Status</h3>
          {isBattleOver && (
            <Button
              variant="outline"
              size="sm"
              onClick={resetBattle}
              className="bg-black/30 border-white/10 hover:bg-degen-blue/20 hover:border-degen-blue/40 text-xs"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Reset
            </Button>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="text-xs text-white/60">Your Team</h4>
            <div className="grid grid-cols-3 gap-2">
              {playerTeam.map((pokemon) => (
                <div 
                  key={pokemon.name}
                  className={`text-center p-2 rounded-md text-xs ${
                    pokemon.hp === 0 
                      ? 'bg-red-900/20 text-white/30' 
                      : playerPokemon?.name === pokemon.name
                        ? 'bg-solana/20 border border-solana/30' 
                        : 'bg-degen-gray'
                  }`}
                >
                  <div className="truncate">{pokemon.name}</div>
                  <div className="text-[10px] mt-1">{pokemon.hp}/{pokemon.maxHp}</div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="text-xs text-white/60">Opponent's Team</h4>
            <div className="grid grid-cols-3 gap-2">
              {opponentTeam.map((pokemon) => (
                <div 
                  key={pokemon.name}
                  className={`text-center p-2 rounded-md text-xs ${
                    pokemon.hp === 0 
                      ? 'bg-red-900/20 text-white/30' 
                      : opponentPokemon?.name === pokemon.name
                        ? 'bg-degen-pink/20 border border-degen-pink/30' 
                        : 'bg-degen-gray'
                  }`}
                >
                  <div className="truncate">{pokemon.name}</div>
                  <div className="text-[10px] mt-1">{pokemon.hp}/{pokemon.maxHp}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default BattleSimulator;
