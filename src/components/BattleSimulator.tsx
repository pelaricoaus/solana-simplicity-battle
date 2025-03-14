
import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Zap, Shield, Sword, RotateCcw, Play, Share2, BookOpen, TrendingUp } from 'lucide-react';
import { cn } from "@/lib/utils";
import { createSolomon, getMoveEffect, getMoveDetails } from "@/data/solomonData";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";
import { TooltipProvider } from "@/components/ui/tooltip";

interface Solomon {
  name: string;
  hp: number;
  maxHp: number;
  moves: string[];
  sprite: string;
  backSprite: string;
  position: { x: number; y: number };
  isAttacking: boolean;
  isHit: boolean;
  stats: {
    attack: number;
    defense: number;
    speed: number;
    special: number;
  };
  type: string[];
}

interface BattleSimulatorProps {
  team: string[];
  onReset: () => void;
}

const BattleSimulator = ({ team, onReset }: BattleSimulatorProps) => {
  const [playerSolomon, setPlayerSolomon] = useState<Solomon | null>(null);
  const [opponentSolomon, setOpponentSolomon] = useState<Solomon | null>(null);
  const [battleLog, setBattleLog] = useState<string[]>(["Battle started! Choose your move."]);
  const [isBattleOver, setIsBattleOver] = useState(false);
  const [playerTeam, setPlayerTeam] = useState<Solomon[]>([]);
  const [opponentTeam, setOpponentTeam] = useState<Solomon[]>([]);
  const [turn, setTurn] = useState<"player" | "opponent">("player");
  const [isAnimating, setIsAnimating] = useState(false);
  const [battleEffect, setBattleEffect] = useState<string | null>(null);
  const [battleMessage, setBattleMessage] = useState<string | null>(null);
  const [selectedMove, setSelectedMove] = useState<string | null>(null);
  const [chartData, setChartData] = useState<number[]>([]);
  
  const battleLogRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Generate random price chart data for background
  useEffect(() => {
    const generateRandomChartData = () => {
      let price = 30000; // Starting BTC price around $30k
      const data: number[] = [];
      
      for (let i = 0; i < 300; i++) { // Increase sample points for better zoom out
        // Random price movement with some volatility
        const change = (Math.random() - 0.48) * 500; // Slight upward bias
        price += change;
        price = Math.max(25000, price); // Don't go below $25k
        data.push(price);
      }
      
      return data;
    };
    
    setChartData(generateRandomChartData());
    
    // Update chart periodically for live effect
    const interval = setInterval(() => {
      setChartData(prev => {
        const newData = [...prev];
        const lastPrice = newData[newData.length - 1];
        const change = (Math.random() - 0.48) * 500;
        const newPrice = Math.max(25000, lastPrice + change);
        
        newData.shift(); // Remove first item
        newData.push(newPrice); // Add new price
        
        return newData;
      });
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);

  // Initialize teams - create 6 pokemon per team
  useEffect(() => {
    // Create player team from the provided team names, filling up to 6 Pokemon
    const basePlayerTeam = team.slice(0, 6);
    
    // If there are less than 6 Pokemon, add random ones to fill
    const playerOptions = ["BONK", "WIF", "BODEN", "BOOK", "SLERF", "POPCAT", "GOATED"]
                          .filter(p => !basePlayerTeam.includes(p));
    
    const neededExtraCount = Math.max(0, 6 - basePlayerTeam.length);
    let extraPlayerPokemon: string[] = [];
    
    if (neededExtraCount > 0) {
      const shuffled = [...playerOptions].sort(() => 0.5 - Math.random());
      extraPlayerPokemon = shuffled.slice(0, neededExtraCount);
    }
    
    const fullPlayerTeam = [...basePlayerTeam, ...extraPlayerPokemon];
    const newPlayerTeam = fullPlayerTeam.map(name => createSolomon(name));
    setPlayerTeam(newPlayerTeam);
    
    // Set first Solomon as active
    if (newPlayerTeam.length > 0) {
      setPlayerSolomon(newPlayerTeam[0]);
    }

    // Create a full opponent team of 6 Pokemon
    const opponentOptions = ["SLOTH", "SAMO", "CAT", "DIAMONDHAND", 
                          "MEGAPUMP", "BOULDER", "PSYCHIC", "JUPITER", 
                          "BOOK", "WIF", "SLERF", "POPCAT", "GOATED"]
                          .filter(p => !fullPlayerTeam.includes(p));
    
    const shuffled = [...opponentOptions].sort(() => 0.5 - Math.random());
    const selectedOpponents = shuffled.slice(0, 6);
    
    const newOpponentTeam = selectedOpponents.map(name => createSolomon(name));
    setOpponentTeam(newOpponentTeam);
    
    // Set first opponent Solomon as active
    if (newOpponentTeam.length > 0) {
      setOpponentSolomon(newOpponentTeam[0]);
    }
    
    const playerName = newPlayerTeam[0]?.name || "Player SOLOMON";
    const opponentName = newOpponentTeam[0]?.name || "Opponent SOLOMON";
    
    setBattleLog([`Battle started! ${playerName} vs ${opponentName}`]);
    
    // Intro animation
    setBattleMessage("BATTLE START!");
    setTimeout(() => setBattleMessage(null), 1500);
  }, [team]);

  // Scroll to bottom of battle log when new messages are added
  useEffect(() => {
    if (battleLogRef.current) {
      battleLogRef.current.scrollTop = battleLogRef.current.scrollHeight;
    }
  }, [battleLog]);

  // Calculate damage based on attacking and defending Solomon stats
  const calculateDamage = (attacker: Solomon, defender: Solomon, moveName: string): number => {
    // Get move details
    const moveDetails = getMoveDetails(moveName);
    
    // Base power of the move
    const power = moveDetails.power;
    
    // Calculate type effectiveness (simplified)
    let effectiveness = 1.0;
    
    // Attack and defense stats - use special stats for special moves
    const attackStat = moveDetails.category === "special" ? attacker.stats.special : attacker.stats.attack;
    const defenseStat = moveDetails.category === "special" ? defender.stats.special : defender.stats.defense;
    
    // Simplified damage formula inspired by Pokemon games
    const baseDamage = Math.floor(((2 * 50 / 5 + 2) * power * attackStat / defenseStat) / 50 + 2);
    
    // Apply STAB (Same Type Attack Bonus) if attacker's type matches move type
    const stab = attacker.type.includes(moveDetails.type) ? 1.5 : 1.0;
    
    // Add some randomness (85%-100%)
    const randomFactor = 0.85 + (Math.random() * 0.15);
    
    // Calculate final damage
    const finalDamage = Math.floor(baseDamage * stab * effectiveness * randomFactor);
    
    return finalDamage;
  };

  // Determine which Solomon moves first based on speed stat
  const determineFirstMover = (
    player: Solomon | null, 
    opponent: Solomon | null, 
    playerMove: string
  ): "player" | "opponent" => {
    if (!player || !opponent) return "player";
    
    // Get move priority
    const playerMoveDetails = getMoveDetails(playerMove);
    const playerPriority = playerMoveDetails.priority || 0;
    
    // For opponent, we don't know the move yet, so assume priority 0
    const opponentPriority = 0;
    
    // If priority differs, higher priority goes first
    if (playerPriority !== opponentPriority) {
      return playerPriority > opponentPriority ? "player" : "opponent";
    }
    
    // If priority is the same, compare speed stats
    return player.stats.speed >= opponent.stats.speed ? "player" : "opponent";
  };

  // Handle performing a move
  const performMove = (moveName: string) => {
    if (!playerSolomon || !opponentSolomon || isBattleOver || isAnimating) return;
    setIsAnimating(true);
    
    // Determine who goes first based on speed and move priority
    const firstMover = determineFirstMover(playerSolomon, opponentSolomon, moveName);
    setSelectedMove(moveName);
    
    if (firstMover === "player") {
      // Player goes first
      executePlayerMove(moveName);
    } else {
      // Opponent goes first
      executeOpponentMove().then(() => {
        // Check if player's Pokemon fainted
        if ((playerSolomon?.hp || 0) <= 0) {
          handlePlayerPokemonFainted();
        } else {
          // If player's Pokemon didn't faint, player can make a move
          executePlayerMove(moveName);
        }
      });
    }
  };

  // Execute player's move
  const executePlayerMove = (moveName: string) => {
    if (!playerSolomon || !opponentSolomon) return Promise.resolve();
    
    return new Promise<void>((resolve) => {
      // Show attack message
      setBattleMessage(`${playerSolomon.name} used ${moveName}!`);
      
      // Determine effect based on move name
      const moveEffect = getMoveEffect(moveName);
      setBattleEffect(moveEffect);
      
      // Set attacking animation
      setPlayerSolomon(prev => prev ? { ...prev, isAttacking: true } : null);
      
      setTimeout(() => {
        // Reset attack animation
        setPlayerSolomon(prev => prev ? { ...prev, isAttacking: false } : null);
        
        // Set opponent as hit
        setOpponentSolomon(prev => prev ? { ...prev, isHit: true } : null);
        
        // Calculate damage based on stats and move
        const damage = calculateDamage(playerSolomon, opponentSolomon, moveName);
        
        // Update battle log
        setBattleLog(prev => [...prev, `${playerSolomon.name} used ${moveName}! Dealt ${damage} damage to ${opponentSolomon.name}.`]);
        
        // Clear effect and message
        setTimeout(() => {
          setBattleEffect(null);
          setBattleMessage(null);
          
          // Update opponent HP and reset hit animation
          setOpponentSolomon(prev => {
            if (!prev) return null;
            const newHp = Math.max(0, prev.hp - damage);
            return { ...prev, isHit: false, hp: newHp };
          });
          
          // Check if opponent fainted
          setTimeout(() => {
            if ((opponentSolomon?.hp || 0) - damage <= 0) {
              handleOpponentPokemonFainted();
            } else {
              // No one fainted, switch to opponent's turn if player went first
              const localFirstMover = determineFirstMover(playerSolomon, opponentSolomon, moveName);
              if (localFirstMover === "player") {
                executeOpponentMove().then(() => {
                  // Check if player's Pokemon fainted after opponent's move
                  if ((playerSolomon?.hp || 0) <= 0) {
                    handlePlayerPokemonFainted();
                  } else {
                    // Both Pokemon survived, next turn
                    setTurn("player");
                    setIsAnimating(false);
                  }
                });
              } else {
                // If opponent went first, we've now completed both moves
                setTurn("player");
                setIsAnimating(false);
              }
            }
            resolve();
          }, 500);
        }, 1000);
      }, 1000);
    });
  };

  // Handle opponent's turn
  const executeOpponentMove = () => {
    if (!playerSolomon || !opponentSolomon) return Promise.resolve();
    
    return new Promise<void>((resolve) => {
      // Select a random move from opponent's moves
      const opponentMove = opponentSolomon.moves[Math.floor(Math.random() * opponentSolomon.moves.length)];
      
      // Show attack message
      setBattleMessage(`${opponentSolomon.name} used ${opponentMove}!`);
      
      // Determine effect based on move name
      const moveEffect = getMoveEffect(opponentMove);
      setBattleEffect(moveEffect);
      
      // Set attacking animation
      setOpponentSolomon(prev => prev ? { ...prev, isAttacking: true } : null);
      
      setTimeout(() => {
        // Reset attack animation
        setOpponentSolomon(prev => prev ? { ...prev, isAttacking: false } : null);
        
        // Set player as hit
        setPlayerSolomon(prev => prev ? { ...prev, isHit: true } : null);
        
        // Calculate damage based on stats
        const damage = calculateDamage(opponentSolomon, playerSolomon, opponentMove);
        
        // Update battle log
        setBattleLog(prev => [...prev, `${opponentSolomon.name} used ${opponentMove}! Dealt ${damage} damage to ${playerSolomon.name}.`]);
        
        // Clear effect and message
        setTimeout(() => {
          setBattleEffect(null);
          setBattleMessage(null);
          
          // Update player HP and reset hit animation
          setPlayerSolomon(prev => {
            if (!prev) return null;
            const newHp = Math.max(0, prev.hp - damage);
            return { ...prev, isHit: false, hp: newHp };
          });
          
          // Check if player fainted
          setTimeout(() => {
            resolve();
          }, 500);
        }, 1000);
      }, 1000);
    });
  };

  // Handle player Pokemon fainting
  const handlePlayerPokemonFainted = () => {
    if (!playerSolomon) return;
    
    // Update the player team to mark the current Pokemon as fainted (hp = 0)
    setPlayerTeam(prevTeam => 
      prevTeam.map(p => 
        p.name === playerSolomon.name ? { ...p, hp: 0 } : p
      )
    );
    
    // Check if there are more Solomon in player's team
    const remainingPlayer = playerTeam.filter(p => 
      p.name !== playerSolomon.name && p.hp > 0
    );
    
    if (remainingPlayer.length > 0) {
      // Send in next player Solomon
      setBattleMessage(`${playerSolomon.name} fainted!`);
      
      setTimeout(() => {
        const next = remainingPlayer[0];
        setBattleLog(prev => [...prev, `${playerSolomon?.name} fainted! You sent in ${next.name}!`]);
        setPlayerSolomon(next);
        
        setTimeout(() => {
          setBattleMessage(null);
          setTurn("player");
          setIsAnimating(false);
        }, 1500);
      }, 1500);
    } else {
      // Defeat - no more player Solomon
      setTimeout(() => {
        setBattleLog(prev => [...prev, `${playerSolomon.name} fainted! You lost the battle!`]);
        setBattleMessage("YOU LOST!");
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
  };

  // Handle opponent Pokemon fainting
  const handleOpponentPokemonFainted = () => {
    if (!opponentSolomon) return;
    
    // Update the opponent team to mark the current Pokemon as fainted (hp = 0)
    setOpponentTeam(prevTeam => 
      prevTeam.map(p => 
        p.name === opponentSolomon.name ? { ...p, hp: 0 } : p
      )
    );
    
    // Check if there are more Solomon in opponent's team
    const remainingOpponents = opponentTeam.filter(p => 
      p.name !== opponentSolomon.name && p.hp > 0
    );
    
    if (remainingOpponents.length > 0) {
      // Send in next opponent Solomon
      setBattleMessage(`${opponentSolomon.name} fainted!`);
      
      setTimeout(() => {
        const next = remainingOpponents[0];
        setBattleLog(prev => [...prev, `${opponentSolomon?.name} fainted! Opponent sent in ${next.name}!`]);
        setOpponentSolomon(next);
        
        setTimeout(() => {
          setBattleMessage(null);
          setTurn("player"); // Player gets another turn after KO
          setIsAnimating(false);
        }, 1500);
      }, 1500);
    } else {
      // Victory - no more opponent Solomon
      setTimeout(() => {
        setBattleLog(prev => [...prev, `${opponentSolomon.name} fainted! You win the battle!`]);
        setBattleMessage("YOU WON!");
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
  };

  const resetBattle = () => {
    onReset();
    toast({
      title: "Battle Reset",
      description: "Ready to build a new team!",
    });
  };

  // Normalize chart data for display with larger view
  const normalizeChartData = () => {
    const min = Math.min(...chartData);
    const max = Math.max(...chartData);
    const range = max - min;
    
    // Scale to fill more of the vertical space but leave room at top/bottom
    return chartData.map(point => 180 - ((point - min) / range) * 140);
  };
  
  const normalizedChartData = normalizeChartData();

  return (
    <div className="w-full max-w-4xl mx-auto glass-card rounded-xl p-5 fade-in">
      <div className="flex items-center gap-2 mb-6">
        <Sword className="h-5 w-5 text-solana" />
        <h2 className="text-xl font-bold text-gradient">SOLOMON Battle Simulator</h2>
        <TrendingUp className="h-4 w-4 text-degen-yellow ml-2" />
      </div>
      
      {/* Battle Arena */}
      <div className="relative bg-gradient-to-b from-black/60 to-degen-gray/60 rounded-xl mb-6 h-72 overflow-hidden">
        {/* Trading chart background - zoomed out for better visibility */}
        <div className="absolute inset-0 opacity-15">
          <svg width="100%" height="100%" viewBox="0 0 300 100" preserveAspectRatio="none">
            {/* Chart grid lines */}
            {[0, 25, 50, 75, 100].map(y => (
              <line 
                key={`grid-${y}`} 
                x1="0" 
                y1={y} 
                x2="300" 
                y2={y} 
                stroke="#555" 
                strokeWidth="0.1" 
                strokeDasharray="0.5"
              />
            ))}
            
            {/* BTC/USD price chart */}
            <polyline
              points={normalizedChartData.map((y, i) => `${i},${ y }`).join(' ')}
              fill="none"
              stroke="#14F195"
              strokeWidth="1"
              strokeLinejoin="round"
              className="animate-pulse"
            />
          </svg>
        </div>
        
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
        
        {/* Player's Solomon - moved closer to center */}
        {playerSolomon && (
          <div className={`absolute bottom-6 left-20 z-10 transition-all duration-300 ${
            playerSolomon.isAttacking ? 'translate-x-10 translate-y-2 scale-110' : 
            playerSolomon.isHit ? 'translate-x-[-4px] translate-y-[-4px]' : ''
          }`}>
            <div className="relative">
              <img 
                src={playerSolomon.backSprite}
                alt={playerSolomon.name}
                className="h-24 pixelated"
                style={{ transform: "scale(2)", imageRendering: "pixelated" }}
              />
              {playerSolomon.isHit && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <img 
                    src="/lovable-uploads/9d5e0fb4-99f9-45e1-89c3-8f0cb900d8ca.png" 
                    alt="Hit marker" 
                    className="h-16 w-16 animate-pulse" 
                  />
                </div>
              )}
              
              {/* HP Bar */}
              <div className="absolute -bottom-7 left-1/2 transform -translate-x-1/2 w-24">
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${playerSolomon.hp / playerSolomon.maxHp > 0.5 ? 'bg-green-500' : playerSolomon.hp / playerSolomon.maxHp > 0.2 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${(playerSolomon.hp / playerSolomon.maxHp) * 100}%` }}
                  ></div>
                </div>
                <div className="text-xs text-white mt-1 text-center">
                  {playerSolomon.hp}/{playerSolomon.maxHp}
                </div>
              </div>
            </div>
            <div className="bg-black/70 p-1 px-2 rounded text-xs absolute -bottom-14 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
              {playerSolomon.name}
            </div>
          </div>
        )}
        
        {/* Opponent's Solomon - moved closer to center */}
        {opponentSolomon && (
          <div className={`absolute top-6 right-20 z-10 transition-all duration-300 ${
            opponentSolomon.isAttacking ? '-translate-x-10 -translate-y-2 scale-110' : 
            opponentSolomon.isHit ? 'translate-x-[4px] translate-y-[4px]' : ''
          }`}>
            <div className="relative">
              <img 
                src={opponentSolomon.sprite}
                alt={opponentSolomon.name}
                className="h-24 pixelated"
                style={{ transform: "scale(2)", imageRendering: "pixelated" }}
              />
              {opponentSolomon.isHit && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <img 
                    src="/lovable-uploads/9d5e0fb4-99f9-45e1-89c3-8f0cb900d8ca.png" 
                    alt="Hit marker" 
                    className="h-16 w-16 animate-pulse" 
                  />
                </div>
              )}
              
              {/* HP Bar - Visible during battle for better feedback */}
              <div className="absolute -bottom-7 left-1/2 transform -translate-x-1/2 w-24">
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${opponentSolomon.hp / opponentSolomon.maxHp > 0.5 ? 'bg-green-500' : opponentSolomon.hp / opponentSolomon.maxHp > 0.2 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${(opponentSolomon.hp / opponentSolomon.maxHp) * 100}%` }}
                  ></div>
                </div>
                <div className="text-xs text-white mt-1 text-center">
                  {opponentSolomon.hp}/{opponentSolomon.maxHp}
                </div>
              </div>
            </div>
            <div className="bg-black/70 p-1 px-2 rounded text-xs absolute -bottom-14 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
              {opponentSolomon.name}
            </div>
          </div>
        )}
        
        {/* Battle platform background */}
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-r from-degen-gray-dark to-degen-gray rounded-b-xl"></div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6 mb-6">
        {/* Player's Solomon panel - 2 columns */}
        <div className="col-span-1 lg:col-span-2">
          {playerSolomon && (
            <Card className="bg-degen-gray border-white/10 p-3 glass-card slide-in stagger-1">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-solana">{playerSolomon.name}</h3>
                  <span className="text-xs text-white/60">Your SOLOMON</span>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>HP</span>
                    <span>{playerSolomon.hp}/{playerSolomon.maxHp}</span>
                  </div>
                  <Progress 
                    value={(playerSolomon.hp / playerSolomon.maxHp) * 100} 
                    className={cn("h-2 bg-white/10 transition-all duration-500", {
                      "animate-pulse": playerSolomon.isHit
                    })}
                  />
                </div>
                
                <div className="pt-1">
                  <h4 className="text-sm text-white/70 mb-1">Moves:</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {playerSolomon.moves.map((move) => {
                      const moveDetails = getMoveDetails(move);
                      return (
                        <TooltipProvider key={move}>
                          <HoverCard>
                            <HoverCardTrigger asChild>
                              <Button
                                onClick={() => performMove(move)}
                                disabled={
                                  turn !== "player" || 
                                  isBattleOver || 
                                  isAnimating
                                }
                                className={`bg-degen-gray-light hover:bg-degen-purple/30 border border-white/5 text-xs py-3 h-auto ${
                                  moveDetails.type === 'Pump' ? "hover:text-red-400" :
                                  moveDetails.type === 'Liquid' ? "hover:text-blue-400" :
                                  moveDetails.type === 'Stake' ? "hover:text-green-400" :
                                  moveDetails.type === 'Buzz' ? "hover:text-yellow-400" :
                                  moveDetails.type === 'Psychic' ? "hover:text-purple-400" :
                                  moveDetails.type === 'Cold' ? "hover:text-cyan-400" :
                                  "hover:text-white"
                                }`}
                                size="sm"
                              >
                                <Zap className={`h-3 w-3 mr-1 flex-shrink-0 ${
                                  moveDetails.type === 'Pump' ? "text-red-400" :
                                  moveDetails.type === 'Liquid' ? "text-blue-400" :
                                  moveDetails.type === 'Stake' ? "text-green-400" :
                                  moveDetails.type === 'Buzz' ? "text-yellow-400" :
                                  moveDetails.type === 'Psychic' ? "text-purple-400" :
                                  moveDetails.type === 'Cold' ? "text-cyan-400" :
                                  "text-degen-yellow"
                                }`} />
                                {move}
                              </Button>
                            </HoverCardTrigger>
                            <HoverCardContent className="bg-black/90 border-white/10 text-white w-72">
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <h4 className="font-bold">{move}</h4>
                                  <span className={`text-xs px-2 py-0.5 rounded ${
                                    moveDetails.type === 'Pump' ? "bg-red-900/50 text-red-400" :
                                    moveDetails.type === 'Liquid' ? "bg-blue-900/50 text-blue-400" :
                                    moveDetails.type === 'Stake' ? "bg-green-900/50 text-green-400" :
                                    moveDetails.type === 'Buzz' ? "bg-yellow-900/50 text-yellow-400" :
                                    moveDetails.type === 'Psychic' ? "bg-purple-900/50 text-purple-400" :
                                    moveDetails.type === 'Cold' ? "bg-cyan-900/50 text-cyan-400" :
                                    "bg-gray-900/50 text-gray-400"
                                  }`}>
                                    {moveDetails.type}
                                  </span>
                                </div>
                                <div className="grid grid-cols-2 gap-1 text-xs">
                                  <div>Power: {moveDetails.power}</div>
                                  <div>Accuracy: {moveDetails.accuracy}%</div>
                                  <div>Category: {moveDetails.category}</div>
                                  <div>Priority: {moveDetails.priority}</div>
                                </div>
                                <p className="text-xs text-white/70">
                                  {moveDetails.description}
                                </p>
                              </div>
                            </HoverCardContent>
                          </HoverCard>
                        </TooltipProvider>
                      );
                    })}
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
        
        {/* Battle Log - 3 columns */}
        <Card className="col-span-1 lg:col-span-3 bg-black/30 border-white/10 p-4 glass-card slide-up stagger-3">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="h-4 w-4 text-white/70" />
            <h3 className="text-sm font-medium text-white/70">Battle Log</h3>
          </div>
          
          <div ref={battleLogRef} className="h-56 overflow-y-auto scrollbar-none space-y-2 text-sm">
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
                  disabled
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
        
        {/* Opponent's Solomon Stats - 2 columns */}
        <div className="col-span-1 lg:col-span-2">
          {opponentSolomon && (
            <Card className="bg-degen-gray border-white/10 p-3 glass-card slide-in stagger-4" style={{ animationDirection: 'reverse' }}>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-degen-pink">{opponentSolomon.name}</h3>
                  <span className="text-xs text-white/60">Opponent</span>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>HP</span>
                    <span>{opponentSolomon.hp}/{opponentSolomon.maxHp}</span>
                  </div>
                  <Progress 
                    value={(opponentSolomon.hp / opponentSolomon.maxHp) * 100} 
                    className={cn("h-2 bg-white/10 transition-all duration-500", {
                      "animate-pulse": opponentSolomon.isHit
                    })}
                  />
                </div>
                
                <div className="pt-2">
                  <h4 className="text-sm text-white/70 mb-1">Stats:</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2 bg-black/20 rounded-md p-1.5">
                      <Shield className="h-3 w-3 text-degen-blue" />
                      <span className="text-xs">DEF: {opponentSolomon.stats.defense}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-black/20 rounded-md p-1.5">
                      <Zap className="h-3 w-3 text-degen-yellow" />
                      <span className="text-xs">SPD: {opponentSolomon.stats.speed}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-black/20 rounded-md p-1.5">
                      <Sword className="h-3 w-3 text-degen-red" />
                      <span className="text-xs">ATK: {opponentSolomon.stats.attack}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-black/20 rounded-md p-1.5">
                      <Share2 className="h-3 w-3 text-degen-purple" />
                      <span className="text-xs">SPC: {opponentSolomon.stats.special}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
      
      {/* Team Status */}
      <Card className="bg-black/20 border-white/10 p-4 glass-card slide-up stagger-5">
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
              {playerTeam.map((solomon) => (
                <div 
                  key={solomon.name}
                  className={`text-center p-2 rounded-md text-xs ${
                    solomon.hp === 0 
                      ? 'bg-red-900/20 text-white/30' 
                      : playerSolomon?.name === solomon.name
                        ? 'bg-solana/20 border border-solana/30' 
                        : 'bg-degen-gray'
                  }`}
                >
                  <div className="truncate">{solomon.name}</div>
                  <div className="text-[10px] mt-1">{solomon.hp}/{solomon.maxHp}</div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="text-xs text-white/60">Opponent's Team</h4>
            <div className="grid grid-cols-3 gap-2">
              {opponentTeam.map((solomon) => (
                <div 
                  key={solomon.name}
                  className={`text-center p-2 rounded-md text-xs ${
                    solomon.hp === 0 
                      ? 'bg-red-900/20 text-white/30' 
                      : opponentSolomon?.name === solomon.name
                        ? 'bg-degen-pink/20 border border-degen-pink/30' 
                        : 'bg-degen-gray'
                  }`}
                >
                  <div className="truncate">{solomon.name}</div>
                  <div className="text-[10px] mt-1">{solomon.hp}/{solomon.maxHp}</div>
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
