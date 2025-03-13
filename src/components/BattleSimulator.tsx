
import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Zap, Shield, Sword, RotateCcw, Play, Share2, BookOpen } from 'lucide-react';
import { cn } from "@/lib/utils";

interface Pokemon {
  name: string;
  hp: number;
  maxHp: number;
  moves: string[];
  sprite?: string;
  position?: { x: number; y: number };
  isAttacking?: boolean;
  isHit?: boolean;
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
    moves: getRandomMoves(),
    sprite: `https://img.pokemondb.net/sprites/black-white/anim/normal/${name.toLowerCase()}.gif`,
    position: { x: 0, y: 0 },
    isAttacking: false,
    isHit: false
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
  const [battleEffect, setBattleEffect] = useState<string | null>(null);
  const [battleMessage, setBattleMessage] = useState<string | null>(null);
  const battleLogRef = useRef<HTMLDivElement>(null);
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
    
    // Intro animation
    setBattleMessage("Battle Start!");
    setTimeout(() => setBattleMessage(null), 1500);
  }, [team]);

  // Scroll to bottom of battle log when new messages are added
  useEffect(() => {
    if (battleLogRef.current) {
      battleLogRef.current.scrollTop = battleLogRef.current.scrollHeight;
    }
  }, [battleLog]);

  const performMove = (moveName: string) => {
    if (isBattleOver || isAnimating || !playerPokemon || !opponentPokemon) return;
    
    setIsAnimating(true);
    
    // Player's turn
    if (turn === "player") {
      // Show attack message
      setBattleMessage(`${playerPokemon.name} used ${moveName}!`);
      
      // Determine effect based on move name
      const moveEffect = getMoveEffect(moveName);
      setBattleEffect(moveEffect);
      
      // Set attacking animation
      setPlayerPokemon(prev => prev ? { ...prev, isAttacking: true } : null);
      
      setTimeout(() => {
        // Reset attack animation
        setPlayerPokemon(prev => prev ? { ...prev, isAttacking: false } : null);
        
        // Set opponent as hit
        setOpponentPokemon(prev => prev ? { ...prev, isHit: true } : null);
        
        // Calculate damage
        const damage = Math.floor(Math.random() * 30) + 10;
        
        // Update battle log
        setBattleLog(prev => [...prev, `${playerPokemon.name} used ${moveName}! Dealt ${damage} damage.`]);
        
        // Clear effect and message
        setTimeout(() => {
          setBattleEffect(null);
          setBattleMessage(null);
          
          // Reset hit animation
          setOpponentPokemon(prev => {
            if (!prev) return null;
            
            const newOpponentHp = Math.max(0, prev.hp - damage);
            return { ...prev, isHit: false, hp: newOpponentHp };
          });
          
          // Check if opponent fainted
          if (opponentPokemon.hp - damage <= 0) {
            const remainingOpponents = opponentTeam.filter(p => p.name !== opponentPokemon.name && p.hp > 0);
            
            setBattleMessage(`${opponentPokemon.name} fainted!`);
            
            if (remainingOpponents.length > 0) {
              // Send in next opponent Pokémon
              const nextOpponent = remainingOpponents[0];
              setTimeout(() => {
                setBattleLog(prev => [...prev, `${opponentPokemon.name} fainted! Opponent sent in ${nextOpponent.name}!`]);
                setBattleMessage(`Go ${nextOpponent.name}!`);
                setOpponentPokemon(nextOpponent);
                
                setTimeout(() => {
                  setBattleMessage(null);
                  setIsAnimating(false);
                }, 1500);
              }, 1500);
            } else {
              // Victory
              setTimeout(() => {
                setBattleLog(prev => [...prev, `${opponentPokemon.name} fainted! You win the battle!`]);
                setBattleMessage("You Won!");
                setIsBattleOver(true);
                
                setTimeout(() => {
                  setBattleMessage(null);
                  setIsAnimating(false);
                  toast({
                    title: "Victory!",
                    description: "You won the battle! Congrats, degen!",
                  });
                }, 2000);
              }, 1500);
            }
          } else {
            // Opponent's turn
            setTurn("opponent");
            setTimeout(() => {
              opponentTurn();
            }, 1000);
          }
        }, 1000);
      }, 1000);
    }
  };

  const opponentTurn = () => {
    if (!playerPokemon || !opponentPokemon) return;
    
    const opponentMove = opponentPokemon.moves[Math.floor(Math.random() * opponentPokemon.moves.length)];
    
    // Show attack message
    setBattleMessage(`${opponentPokemon.name} used ${opponentMove}!`);
    
    // Determine effect based on move name
    const moveEffect = getMoveEffect(opponentMove);
    setBattleEffect(moveEffect);
    
    // Set attacking animation
    setOpponentPokemon(prev => prev ? { ...prev, isAttacking: true } : null);
    
    setTimeout(() => {
      // Reset attack animation
      setOpponentPokemon(prev => prev ? { ...prev, isAttacking: false } : null);
      
      // Set player as hit
      setPlayerPokemon(prev => prev ? { ...prev, isHit: true } : null);
      
      // Calculate damage
      const damage = Math.floor(Math.random() * 25) + 5;
      
      // Update battle log
      setBattleLog(prev => [...prev, `${opponentPokemon.name} used ${opponentMove}! Dealt ${damage} damage.`]);
      
      // Clear effect and message
      setTimeout(() => {
        setBattleEffect(null);
        setBattleMessage(null);
        
        // Reset hit animation and update HP
        setPlayerPokemon(prev => {
          if (!prev) return null;
          
          const newPlayerHp = Math.max(0, prev.hp - damage);
          return { ...prev, isHit: false, hp: newPlayerHp };
        });
        
        // Check if player's Pokémon fainted
        if (playerPokemon.hp - damage <= 0) {
          const remainingPokemon = playerTeam.filter(p => p.name !== playerPokemon.name && p.hp > 0);
          
          setBattleMessage(`${playerPokemon.name} fainted!`);
          
          if (remainingPokemon.length > 0) {
            // Send in next Pokémon
            setTimeout(() => {
              setBattleLog(prev => [...prev, `${playerPokemon.name} fainted! Choose your next Pokémon!`]);
              setBattleMessage(`Go ${remainingPokemon[0].name}!`);
              setPlayerPokemon(remainingPokemon[0]);
              
              setTimeout(() => {
                setBattleMessage(null);
                setTurn("player");
                setIsAnimating(false);
              }, 1500);
            }, 1500);
          } else {
            // Defeat
            setTimeout(() => {
              setBattleLog(prev => [...prev, `${playerPokemon.name} fainted! You lost the battle!`]);
              setBattleMessage("You Lost!");
              setIsBattleOver(true);
              
              setTimeout(() => {
                setBattleMessage(null);
                setIsAnimating(false);
                toast({
                  title: "Defeat",
                  description: "You lost the battle. Try again!",
                  variant: "destructive",
                });
              }, 2000);
            }, 1500);
          }
        } else {
          // Back to player's turn
          setTurn("player");
          setIsAnimating(false);
        }
      }, 1000);
    }, 1000);
  };

  const getMoveEffect = (moveName: string): string => {
    // Map move names to effect styles
    const moveEffects: Record<string, string> = {
      "Thunderbolt": "lightning",
      "Flamethrower": "fire",
      "Hydro Pump": "water",
      "Solar Beam": "grass",
      "Psychic": "psychic",
      "Earthquake": "ground",
      "Ice Beam": "ice",
      "Blizzard": "ice",
      "Fire Blast": "fire",
      "Tackle": "normal",
      "Quick Attack": "normal",
      "Hyper Beam": "normal"
    };
    
    return moveEffects[moveName] || "normal";
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
      
      {/* Battle Arena */}
      <div className="relative bg-gradient-to-b from-black/60 to-degen-gray/60 rounded-xl mb-6 h-64 overflow-hidden">
        {/* Battle message overlay */}
        {battleMessage && (
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <div className="bg-black/70 text-white px-6 py-3 rounded-lg text-2xl font-bold animate-bounce">
              {battleMessage}
            </div>
          </div>
        )}
        
        {/* Battle effect overlay */}
        {battleEffect && (
          <div className={`absolute inset-0 z-10 opacity-40 ${
            battleEffect === "fire" ? "bg-gradient-to-r from-orange-600 to-red-600 animate-pulse" :
            battleEffect === "water" ? "bg-gradient-to-r from-blue-500 to-cyan-500 animate-pulse" :
            battleEffect === "grass" ? "bg-gradient-to-r from-green-500 to-emerald-500 animate-pulse" :
            battleEffect === "lightning" ? "bg-yellow-400 animate-flash" :
            battleEffect === "psychic" ? "bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse" :
            battleEffect === "ground" ? "bg-gradient-to-r from-amber-700 to-yellow-800 animate-shake" :
            battleEffect === "ice" ? "bg-gradient-to-r from-cyan-300 to-blue-300 animate-pulse" :
            "bg-white animate-flash opacity-20"
          }`} />
        )}
        
        {/* Player Pokémon */}
        {playerPokemon && (
          <div className={`absolute bottom-4 left-4 z-10 transition-all duration-300 ${
            playerPokemon.isAttacking ? 'translate-x-6 translate-y-2 scale-110' : 
            playerPokemon.isHit ? 'translate-x-[-4px] translate-y-[-4px] animate-shake' : ''
          }`}>
            <div className="relative">
              <img 
                src={playerPokemon.sprite || `https://img.pokemondb.net/sprites/black-white/anim/back-normal/${playerPokemon.name.toLowerCase()}.gif`} 
                alt={playerPokemon.name}
                className="h-24 pixelated"
                style={{ transform: "scale(2)", imageRendering: "pixelated" }}
              />
              {playerPokemon.isHit && (
                <div className="absolute inset-0 bg-red-500 opacity-50 animate-flash rounded-full"></div>
              )}
            </div>
            <div className="bg-black/70 p-1 px-2 rounded text-xs absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
              {playerPokemon.name}
            </div>
          </div>
        )}
        
        {/* Opponent Pokémon */}
        {opponentPokemon && (
          <div className={`absolute top-4 right-4 z-10 transition-all duration-300 ${
            opponentPokemon.isAttacking ? '-translate-x-6 -translate-y-2 scale-110' : 
            opponentPokemon.isHit ? 'translate-x-[4px] translate-y-[4px] animate-shake' : ''
          }`}>
            <div className="relative">
              <img 
                src={opponentPokemon.sprite || `https://img.pokemondb.net/sprites/black-white/anim/normal/${opponentPokemon.name.toLowerCase()}.gif`} 
                alt={opponentPokemon.name}
                className="h-24 pixelated"
                style={{ transform: "scale(2)", imageRendering: "pixelated" }}
              />
              {opponentPokemon.isHit && (
                <div className="absolute inset-0 bg-red-500 opacity-50 animate-flash rounded-full"></div>
              )}
            </div>
            <div className="bg-black/70 p-1 px-2 rounded text-xs absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
              {opponentPokemon.name}
            </div>
          </div>
        )}
        
        {/* Battle platform background */}
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-r from-degen-gray-dark to-degen-gray rounded-b-xl"></div>
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
                  className={cn("h-2 bg-white/10", {
                    "animate-pulse": playerPokemon.isHit
                  })}
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
                      className={`bg-degen-gray-light hover:bg-degen-purple/30 border border-white/5 text-sm ${
                        getMoveEffect(move) === "fire" ? "hover:text-red-400" :
                        getMoveEffect(move) === "water" ? "hover:text-blue-400" :
                        getMoveEffect(move) === "grass" ? "hover:text-green-400" :
                        getMoveEffect(move) === "lightning" ? "hover:text-yellow-400" :
                        getMoveEffect(move) === "psychic" ? "hover:text-purple-400" :
                        getMoveEffect(move) === "ice" ? "hover:text-cyan-400" :
                        "hover:text-white"
                      }`}
                      size="sm"
                    >
                      <Zap className={`h-3 w-3 mr-1 ${
                        getMoveEffect(move) === "fire" ? "text-red-400" :
                        getMoveEffect(move) === "water" ? "text-blue-400" :
                        getMoveEffect(move) === "grass" ? "text-green-400" :
                        getMoveEffect(move) === "lightning" ? "text-yellow-400" :
                        getMoveEffect(move) === "psychic" ? "text-purple-400" :
                        getMoveEffect(move) === "ice" ? "text-cyan-400" :
                        "text-degen-yellow"
                      }`} />
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
          
          <div ref={battleLogRef} className="h-48 overflow-y-auto scrollbar-none space-y-2 text-sm">
            {battleLog.map((log, index) => (
              <div 
                key={index} 
                className={`p-2 rounded-md ${index % 2 === 0 ? 'bg-degen-gray' : 'bg-black/20'} ${
                  index === battleLog.length - 1 ? 'animate-fade-in' : ''
                }`}
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
                  className={cn("h-2 bg-white/10", {
                    "animate-pulse": opponentPokemon.isHit
                  })}
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
