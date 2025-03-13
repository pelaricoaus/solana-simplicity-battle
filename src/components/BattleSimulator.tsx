
import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Zap, Shield, Sword, RotateCcw, Play, Share2, BookOpen, TrendingUp } from 'lucide-react';
import { cn } from "@/lib/utils";

// Pokemon stats from the original game
const POKEMON_BASE_STATS: Record<string, { hp: number, attack: number, defense: number, speed: number, special: number }> = {
  "Venusaur": { hp: 80, attack: 82, defense: 83, speed: 80, special: 100 },
  "Charizard": { hp: 78, attack: 84, defense: 78, speed: 100, special: 85 },
  "Blastoise": { hp: 79, attack: 83, defense: 100, speed: 78, special: 85 },
  "Pikachu": { hp: 35, attack: 55, defense: 40, speed: 90, special: 50 },
  "Jigglypuff": { hp: 115, attack: 45, defense: 20, speed: 20, special: 25 },
  "Gengar": { hp: 60, attack: 65, defense: 60, speed: 110, special: 130 },
  "Gyarados": { hp: 95, attack: 125, defense: 79, speed: 81, special: 100 },
  "Dragonite": { hp: 91, attack: 134, defense: 95, speed: 80, special: 100 },
  "Mewtwo": { hp: 106, attack: 110, defense: 90, speed: 130, special: 154 },
  "Snorlax": { hp: 160, attack: 110, defense: 65, speed: 30, special: 65 },
  // Add more Gen1 Pokémon as needed
};

// Default for Pokémon not in the list
const DEFAULT_STATS = { hp: 70, attack: 70, defense: 70, speed: 70, special: 70 };

interface Pokemon {
  name: string;
  hp: number;
  maxHp: number;
  moves: string[];
  sprite?: string;
  position?: { x: number; y: number };
  isAttacking?: boolean;
  isHit?: boolean;
  stats: {
    attack: number;
    defense: number;
    speed: number;
    special: number;
  };
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

// Convert a Pokémon name to a full Pokémon object with appropriate HP based on stats
const createPokemon = (name: string): Pokemon => {
  const stats = POKEMON_BASE_STATS[name] || DEFAULT_STATS;
  return {
    name,
    hp: stats.hp * 2, // Multiply by 2 to make battles last longer
    maxHp: stats.hp * 2,
    moves: getRandomMoves(),
    sprite: `https://img.pokemondb.net/sprites/black-white/anim/normal/${name.toLowerCase()}.gif`,
    position: { x: 0, y: 0 },
    isAttacking: false,
    isHit: false,
    stats: {
      attack: stats.attack,
      defense: stats.defense,
      speed: stats.speed,
      special: stats.special
    }
  };
};

const BattleSimulator = ({ team, onReset }: BattleSimulatorProps) => {
  // Player's active Pokémon (2 for double battles)
  const [playerPokemon1, setPlayerPokemon1] = useState<Pokemon | null>(null);
  const [playerPokemon2, setPlayerPokemon2] = useState<Pokemon | null>(null);
  
  // Opponent's active Pokémon (2 for double battles)
  const [opponentPokemon1, setOpponentPokemon1] = useState<Pokemon | null>(null);
  const [opponentPokemon2, setOpponentPokemon2] = useState<Pokemon | null>(null);
  
  const [battleLog, setBattleLog] = useState<string[]>(["Double battle started! Choose your move."]);
  const [isBattleOver, setIsBattleOver] = useState(false);
  const [playerTeam, setPlayerTeam] = useState<Pokemon[]>([]);
  const [opponentTeam, setOpponentTeam] = useState<Pokemon[]>([]);
  const [turn, setTurn] = useState<"player" | "opponent">("player");
  const [isAnimating, setIsAnimating] = useState(false);
  const [battleEffect, setBattleEffect] = useState<string | null>(null);
  const [battleMessage, setBattleMessage] = useState<string | null>(null);
  const [targetPokemon, setTargetPokemon] = useState<"opponent1" | "opponent2" | null>(null);
  const [selectedMove, setSelectedMove] = useState<string | null>(null);
  const [selectedAttacker, setSelectedAttacker] = useState<"pokemon1" | "pokemon2" | null>(null);
  const [chartData, setChartData] = useState<number[]>([]);
  
  const battleLogRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Generate random price chart data for background
  useEffect(() => {
    const generateRandomChartData = () => {
      let price = 30000; // Starting BTC price around $30k
      const data: number[] = [];
      
      for (let i = 0; i < 100; i++) {
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

  // Initialize teams and first Pokémon
  useEffect(() => {
    // Create player team from the provided team names
    const newPlayerTeam = team.map(createPokemon);
    setPlayerTeam(newPlayerTeam);
    
    // Set first two Pokémon as active for double battle
    if (newPlayerTeam.length >= 2) {
      setPlayerPokemon1(newPlayerTeam[0]);
      setPlayerPokemon2(newPlayerTeam[1]);
    } else if (newPlayerTeam.length === 1) {
      setPlayerPokemon1(newPlayerTeam[0]);
      // Create a default second Pokémon if team has only one
      const secondPokemon = createPokemon("Pikachu");
      setPlayerPokemon2(secondPokemon);
      setPlayerTeam([...newPlayerTeam, secondPokemon]);
    }

    // Create a random opponent team
    const opponentPool = ["Venusaur", "Charizard", "Blastoise", "Pikachu", "Jigglypuff", 
                        "Gengar", "Gyarados", "Dragonite", "Mewtwo", "Snorlax"]
                        .filter(p => !team.includes(p));
    const opponentTeamSize = Math.min(team.length, opponentPool.length);
    const shuffled = [...opponentPool].sort(() => 0.5 - Math.random());
    const selectedOpponents = shuffled.slice(0, opponentTeamSize);
    
    const newOpponentTeam = selectedOpponents.map(createPokemon);
    setOpponentTeam(newOpponentTeam);
    
    // Set first two opponent Pokémon as active
    if (newOpponentTeam.length >= 2) {
      setOpponentPokemon1(newOpponentTeam[0]);
      setOpponentPokemon2(newOpponentTeam[1]);
    } else if (newOpponentTeam.length === 1) {
      setOpponentPokemon1(newOpponentTeam[0]);
      // Create a default second Pokémon if team has only one
      const secondPokemon = createPokemon("Gengar");
      setOpponentPokemon2(secondPokemon);
      setOpponentTeam([...newOpponentTeam, secondPokemon]);
    }
    
    const player1Name = newPlayerTeam[0]?.name || "Player Pokémon 1";
    const player2Name = newPlayerTeam[1]?.name || "Player Pokémon 2";
    const opponent1Name = newOpponentTeam[0]?.name || "Opponent Pokémon 1";
    const opponent2Name = newOpponentTeam[1]?.name || "Opponent Pokémon 2";
    
    setBattleLog([`Double battle started! ${player1Name} & ${player2Name} vs ${opponent1Name} & ${opponent2Name}`]);
    
    // Intro animation
    setBattleMessage("DOUBLE BATTLE START!");
    setTimeout(() => setBattleMessage(null), 1500);
  }, [team]);

  // Scroll to bottom of battle log when new messages are added
  useEffect(() => {
    if (battleLogRef.current) {
      battleLogRef.current.scrollTop = battleLogRef.current.scrollHeight;
    }
  }, [battleLog]);

  // Calculate damage based on attacking and defending Pokémon stats
  const calculateDamage = (attacker: Pokemon, defender: Pokemon): number => {
    // Simple damage formula that takes stats into account
    const attackStat = attacker.stats.attack;
    const defenseStat = defender.stats.defense;
    
    const baseDamage = Math.floor((attackStat / defenseStat) * 20);
    
    // Add some randomness (±20%)
    const randomFactor = 0.8 + (Math.random() * 0.4);
    
    return Math.floor(baseDamage * randomFactor);
  };

  // Handle selecting an opponent's Pokémon to target
  const selectTarget = (target: "opponent1" | "opponent2") => {
    if (!selectedMove || !selectedAttacker) return;
    
    const attackerPokemon = selectedAttacker === "pokemon1" ? playerPokemon1 : playerPokemon2;
    const targetPokemon = target === "opponent1" ? opponentPokemon1 : opponentPokemon2;
    
    if (!attackerPokemon || !targetPokemon) return;
    
    performMove(selectedMove, attackerPokemon, targetPokemon, target);
    setSelectedMove(null);
    setSelectedAttacker(null);
    setTargetPokemon(null);
  };

  // Select a move and the attacking Pokémon
  const selectMove = (moveName: string, attacker: "pokemon1" | "pokemon2") => {
    if (isBattleOver || isAnimating || turn !== "player") return;
    
    setSelectedMove(moveName);
    setSelectedAttacker(attacker);
    
    // If we've selected both a move and an attacker, prompt for target selection
    toast({
      title: "Select Target",
      description: "Choose which opponent Pokémon to attack",
    });
  };

  const performMove = (moveName: string, attackerPokemon: Pokemon, targetPokemon: Pokemon, targetKey: "opponent1" | "opponent2") => {
    if (isBattleOver || isAnimating) return;
    
    setIsAnimating(true);
    
    // Player's turn
    if (turn === "player") {
      // Show attack message
      setBattleMessage(`${attackerPokemon.name} used ${moveName}!`);
      
      // Determine effect based on move name
      const moveEffect = getMoveEffect(moveName);
      setBattleEffect(moveEffect);
      
      // Set attacking animation
      if (attackerPokemon === playerPokemon1) {
        setPlayerPokemon1(prev => prev ? { ...prev, isAttacking: true } : null);
      } else {
        setPlayerPokemon2(prev => prev ? { ...prev, isAttacking: true } : null);
      }
      
      setTimeout(() => {
        // Reset attack animation
        if (attackerPokemon === playerPokemon1) {
          setPlayerPokemon1(prev => prev ? { ...prev, isAttacking: false } : null);
        } else {
          setPlayerPokemon2(prev => prev ? { ...prev, isAttacking: false } : null);
        }
        
        // Set opponent as hit
        if (targetKey === "opponent1") {
          setOpponentPokemon1(prev => prev ? { ...prev, isHit: true } : null);
        } else {
          setOpponentPokemon2(prev => prev ? { ...prev, isHit: true } : null);
        }
        
        // Calculate damage based on stats
        const damage = calculateDamage(attackerPokemon, targetPokemon);
        
        // Update battle log
        setBattleLog(prev => [...prev, `${attackerPokemon.name} used ${moveName}! Dealt ${damage} damage to ${targetPokemon.name}.`]);
        
        // Clear effect and message
        setTimeout(() => {
          setBattleEffect(null);
          setBattleMessage(null);
          
          // Update target HP and reset hit animation
          if (targetKey === "opponent1") {
            setOpponentPokemon1(prev => {
              if (!prev) return null;
              const newHp = Math.max(0, prev.hp - damage);
              return { ...prev, isHit: false, hp: newHp };
            });
          } else {
            setOpponentPokemon2(prev => {
              if (!prev) return null;
              const newHp = Math.max(0, prev.hp - damage);
              return { ...prev, isHit: false, hp: newHp };
            });
          }
          
          // Check if both opponent Pokémon have fainted
          const opponent1Hp = targetKey === "opponent1" 
            ? Math.max(0, targetPokemon.hp - damage) 
            : opponentPokemon1?.hp || 0;
            
          const opponent2Hp = targetKey === "opponent2" 
            ? Math.max(0, targetPokemon.hp - damage) 
            : opponentPokemon2?.hp || 0;
          
          if (opponent1Hp <= 0 && opponent2Hp <= 0) {
            // Check if there are more Pokémon in opponent's team
            const remainingOpponents = opponentTeam.filter(p => 
              (p.name !== opponentPokemon1?.name && p.name !== opponentPokemon2?.name) && p.hp > 0
            );
            
            if (remainingOpponents.length >= 2) {
              // Send in next two opponent Pokémon
              const next1 = remainingOpponents[0];
              const next2 = remainingOpponents[1];
              
              setBattleMessage("Opponent sends new Pokémon!");
              
              setTimeout(() => {
                setBattleLog(prev => [...prev, `Opponent's Pokémon fainted! Opponent sent in ${next1.name} and ${next2.name}!`]);
                setOpponentPokemon1(next1);
                setOpponentPokemon2(next2);
                
                setTimeout(() => {
                  setBattleMessage(null);
                  setTurn("player"); // Player gets another turn after KO
                  setIsAnimating(false);
                }, 1500);
              }, 1500);
            } else if (remainingOpponents.length === 1) {
              // Send in last remaining opponent Pokémon
              const next = remainingOpponents[0];
              
              setBattleMessage("Opponent sends last Pokémon!");
              
              setTimeout(() => {
                setBattleLog(prev => [...prev, `Opponent's Pokémon fainted! Opponent sent in ${next.name}!`]);
                setOpponentPokemon1(next);
                setOpponentPokemon2(null);
                
                setTimeout(() => {
                  setBattleMessage(null);
                  setTurn("player");
                  setIsAnimating(false);
                }, 1500);
              }, 1500);
            } else {
              // Victory - no more opponent Pokémon
              setTimeout(() => {
                setBattleLog(prev => [...prev, `All opponent's Pokémon fainted! You win the battle!`]);
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
          } else if (targetKey === "opponent1" && opponent1Hp <= 0) {
            // Only opponent1 fainted
            setBattleMessage(`${targetPokemon.name} fainted!`);
            
            const remainingOpponents = opponentTeam.filter(p => 
              p.name !== targetPokemon.name && p.hp > 0 && p.name !== opponentPokemon2?.name
            );
            
            if (remainingOpponents.length > 0) {
              // Replace the fainted Pokémon
              setTimeout(() => {
                const next = remainingOpponents[0];
                setBattleLog(prev => [...prev, `${targetPokemon.name} fainted! Opponent sent in ${next.name}!`]);
                setOpponentPokemon1(next);
                
                setTimeout(() => {
                  setBattleMessage(null);
                  setTurn("opponent"); // Switch to opponent's turn
                  opponentTurn();
                }, 1500);
              }, 1500);
            } else {
              // No replacement, continue with one Pokémon
              setTimeout(() => {
                setBattleLog(prev => [...prev, `${targetPokemon.name} fainted! Opponent has one Pokémon left.`]);
                setOpponentPokemon1(opponentPokemon2);
                setOpponentPokemon2(null);
                
                setTimeout(() => {
                  setBattleMessage(null);
                  setTurn("opponent");
                  opponentTurn();
                }, 1500);
              }, 1500);
            }
          } else if (targetKey === "opponent2" && opponent2Hp <= 0) {
            // Only opponent2 fainted
            setBattleMessage(`${targetPokemon.name} fainted!`);
            
            const remainingOpponents = opponentTeam.filter(p => 
              p.name !== targetPokemon.name && p.hp > 0 && p.name !== opponentPokemon1?.name
            );
            
            if (remainingOpponents.length > 0) {
              // Replace the fainted Pokémon
              setTimeout(() => {
                const next = remainingOpponents[0];
                setBattleLog(prev => [...prev, `${targetPokemon.name} fainted! Opponent sent in ${next.name}!`]);
                setOpponentPokemon2(next);
                
                setTimeout(() => {
                  setBattleMessage(null);
                  setTurn("opponent");
                  opponentTurn();
                }, 1500);
              }, 1500);
            } else {
              // No replacement, continue with one Pokémon
              setTimeout(() => {
                setBattleLog(prev => [...prev, `${targetPokemon.name} fainted! Opponent has one Pokémon left.`]);
                setOpponentPokemon2(null);
                
                setTimeout(() => {
                  setBattleMessage(null);
                  setTurn("opponent");
                  opponentTurn();
                }, 1500);
              }, 1500);
            }
          } else {
            // No one fainted, switch to opponent's turn
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
    if (!playerPokemon1 && !playerPokemon2) {
      // No player Pokémon left, should not happen but handling just in case
      setIsBattleOver(true);
      return;
    }
    
    // Decide which opponent Pokémon will attack
    const attacker = opponentPokemon1 && opponentPokemon2 
      ? Math.random() > 0.5 ? opponentPokemon1 : opponentPokemon2
      : opponentPokemon1 || opponentPokemon2;
      
    if (!attacker) {
      // No opponent Pokémon left, should not happen but handling just in case
      return;
    }
    
    // Decide which player Pokémon to target
    const target = playerPokemon1 && playerPokemon2 
      ? Math.random() > 0.5 ? playerPokemon1 : playerPokemon2
      : playerPokemon1 || playerPokemon2;
      
    if (!target) return;
    
    const targetKey = target === playerPokemon1 ? "player1" : "player2";
    
    // Select a random move
    const opponentMove = attacker.moves[Math.floor(Math.random() * attacker.moves.length)];
    
    // Show attack message
    setBattleMessage(`${attacker.name} used ${opponentMove}!`);
    
    // Determine effect based on move name
    const moveEffect = getMoveEffect(opponentMove);
    setBattleEffect(moveEffect);
    
    // Set attacking animation
    if (attacker === opponentPokemon1) {
      setOpponentPokemon1(prev => prev ? { ...prev, isAttacking: true } : null);
    } else {
      setOpponentPokemon2(prev => prev ? { ...prev, isAttacking: true } : null);
    }
    
    setTimeout(() => {
      // Reset attack animation
      if (attacker === opponentPokemon1) {
        setOpponentPokemon1(prev => prev ? { ...prev, isAttacking: false } : null);
      } else {
        setOpponentPokemon2(prev => prev ? { ...prev, isAttacking: false } : null);
      }
      
      // Set player as hit
      if (targetKey === "player1") {
        setPlayerPokemon1(prev => prev ? { ...prev, isHit: true } : null);
      } else {
        setPlayerPokemon2(prev => prev ? { ...prev, isHit: true } : null);
      }
      
      // Calculate damage based on stats
      const damage = calculateDamage(attacker, target);
      
      // Update battle log
      setBattleLog(prev => [...prev, `${attacker.name} used ${opponentMove}! Dealt ${damage} damage to ${target.name}.`]);
      
      // Clear effect and message
      setTimeout(() => {
        setBattleEffect(null);
        setBattleMessage(null);
        
        // Reset hit animation and update HP
        if (targetKey === "player1") {
          setPlayerPokemon1(prev => {
            if (!prev) return null;
            const newHp = Math.max(0, prev.hp - damage);
            return { ...prev, isHit: false, hp: newHp };
          });
        } else {
          setPlayerPokemon2(prev => {
            if (!prev) return null;
            const newHp = Math.max(0, prev.hp - damage);
            return { ...prev, isHit: false, hp: newHp };
          });
        }
        
        // Check if both player Pokémon have fainted
        const player1Hp = targetKey === "player1" 
          ? Math.max(0, target.hp - damage) 
          : playerPokemon1?.hp || 0;
          
        const player2Hp = targetKey === "player2" 
          ? Math.max(0, target.hp - damage) 
          : playerPokemon2?.hp || 0;
        
        if (player1Hp <= 0 && player2Hp <= 0) {
          // Check if there are more Pokémon in player's team
          const remainingPokemon = playerTeam.filter(p => 
            (p.name !== playerPokemon1?.name && p.name !== playerPokemon2?.name) && p.hp > 0
          );
          
          if (remainingPokemon.length >= 2) {
            // Send in next two player Pokémon
            setBattleMessage("Choose your next Pokémon!");
            
            setTimeout(() => {
              setBattleLog(prev => [...prev, `Your Pokémon fainted! Choose your next Pokémon.`]);
              setPlayerPokemon1(remainingPokemon[0]);
              setPlayerPokemon2(remainingPokemon[1]);
              
              setTimeout(() => {
                setBattleMessage(null);
                setTurn("player");
                setIsAnimating(false);
              }, 1500);
            }, 1500);
          } else if (remainingPokemon.length === 1) {
            // Send in last remaining player Pokémon
            setBattleMessage("Choose your last Pokémon!");
            
            setTimeout(() => {
              setBattleLog(prev => [...prev, `Your Pokémon fainted! You have one Pokémon left.`]);
              setPlayerPokemon1(remainingPokemon[0]);
              setPlayerPokemon2(null);
              
              setTimeout(() => {
                setBattleMessage(null);
                setTurn("player");
                setIsAnimating(false);
              }, 1500);
            }, 1500);
          } else {
            // Defeat - no more player Pokémon
            setTimeout(() => {
              setBattleLog(prev => [...prev, `All your Pokémon fainted! You lost the battle!`]);
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
        } else if (targetKey === "player1" && player1Hp <= 0) {
          // Only player1 fainted
          setBattleMessage(`${target.name} fainted!`);
          
          const remainingPokemon = playerTeam.filter(p => 
            p.name !== target.name && p.hp > 0 && p.name !== playerPokemon2?.name
          );
          
          if (remainingPokemon.length > 0) {
            // Replace the fainted Pokémon
            setTimeout(() => {
              const next = remainingPokemon[0];
              setBattleLog(prev => [...prev, `${target.name} fainted! You sent in ${next.name}!`]);
              setPlayerPokemon1(next);
              
              setTimeout(() => {
                setBattleMessage(null);
                setTurn("player");
                setIsAnimating(false);
              }, 1500);
            }, 1500);
          } else {
            // No replacement, continue with one Pokémon
            setTimeout(() => {
              setBattleLog(prev => [...prev, `${target.name} fainted! You have one Pokémon left.`]);
              setPlayerPokemon1(playerPokemon2);
              setPlayerPokemon2(null);
              
              setTimeout(() => {
                setBattleMessage(null);
                setTurn("player");
                setIsAnimating(false);
              }, 1500);
            }, 1500);
          }
        } else if (targetKey === "player2" && player2Hp <= 0) {
          // Only player2 fainted
          setBattleMessage(`${target.name} fainted!`);
          
          const remainingPokemon = playerTeam.filter(p => 
            p.name !== target.name && p.hp > 0 && p.name !== playerPokemon1?.name
          );
          
          if (remainingPokemon.length > 0) {
            // Replace the fainted Pokémon
            setTimeout(() => {
              const next = remainingPokemon[0];
              setBattleLog(prev => [...prev, `${target.name} fainted! You sent in ${next.name}!`]);
              setPlayerPokemon2(next);
              
              setTimeout(() => {
                setBattleMessage(null);
                setTurn("player");
                setIsAnimating(false);
              }, 1500);
            }, 1500);
          } else {
            // No replacement, continue with one Pokémon
            setTimeout(() => {
              setBattleLog(prev => [...prev, `${target.name} fainted! You have one Pokémon left.`]);
              setPlayerPokemon2(null);
              
              setTimeout(() => {
                setBattleMessage(null);
                setTurn("player");
                setIsAnimating(false);
              }, 1500);
            }, 1500);
          }
        } else {
          // No one fainted, switch to player's turn
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

  // Normalize chart data for display
  const normalizeChartData = () => {
    const min = Math.min(...chartData);
    const max = Math.max(...chartData);
    const range = max - min;
    
    return chartData.map(point => 200 - ((point - min) / range) * 180);
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
        {/* Trading chart background */}
        <div className="absolute inset-0 opacity-15">
          <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
            {/* Chart grid lines */}
            {[0, 25, 50, 75, 100].map(y => (
              <line 
                key={`grid-${y}`} 
                x1="0" 
                y1={y} 
                x2="100" 
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
        
        {/* Player's Pokémon 1 */}
        {playerPokemon1 && (
          <div className={`absolute bottom-4 left-4 z-10 transition-all duration-300 ${
            playerPokemon1.isAttacking ? 'translate-x-6 translate-y-2 scale-110' : 
            playerPokemon1.isHit ? 'translate-x-[-4px] translate-y-[-4px]' : ''
          }`}>
            <div className="relative">
              <img 
                src={`https://img.pokemondb.net/sprites/black-white/anim/back-normal/${playerPokemon1.name.toLowerCase()}.gif`} 
                alt={playerPokemon1.name}
                className="h-24 pixelated"
                style={{ transform: "scale(2)", imageRendering: "pixelated" }}
              />
              {playerPokemon1.isHit && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <img 
                    src="/lovable-uploads/f2ffc07f-b49c-45a9-88f4-df71b8d1dd61.png" 
                    alt="Hit marker" 
                    className="h-16 w-16 animate-pulse" 
                  />
                </div>
              )}
              
              {/* HP Bar */}
              <div className="absolute -bottom-7 left-1/2 transform -translate-x-1/2 w-24">
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${playerPokemon1.hp / playerPokemon1.maxHp > 0.5 ? 'bg-green-500' : playerPokemon1.hp / playerPokemon1.maxHp > 0.2 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${(playerPokemon1.hp / playerPokemon1.maxHp) * 100}%` }}
                  ></div>
                </div>
                <div className="text-xs text-white mt-1 text-center">
                  {playerPokemon1.hp}/{playerPokemon1.maxHp}
                </div>
              </div>
            </div>
            <div className="bg-black/70 p-1 px-2 rounded text-xs absolute -bottom-14 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
              {playerPokemon1.name}
            </div>
          </div>
        )}
        
        {/* Player's Pokémon 2 */}
        {playerPokemon2 && (
          <div className={`absolute bottom-4 left-28 z-10 transition-all duration-300 ${
            playerPokemon2.isAttacking ? 'translate-x-6 translate-y-2 scale-110' : 
            playerPokemon2.isHit ? 'translate-x-[-4px] translate-y-[-4px]' : ''
          }`}>
            <div className="relative">
              <img 
                src={`https://img.pokemondb.net/sprites/black-white/anim/back-normal/${playerPokemon2.name.toLowerCase()}.gif`} 
                alt={playerPokemon2.name}
                className="h-24 pixelated"
                style={{ transform: "scale(2)", imageRendering: "pixelated" }}
              />
              {playerPokemon2.isHit && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <img 
                    src="/lovable-uploads/f2ffc07f-b49c-45a9-88f4-df71b8d1dd61.png" 
                    alt="Hit marker" 
                    className="h-16 w-16 animate-pulse" 
                  />
                </div>
              )}
              
              {/* HP Bar */}
              <div className="absolute -bottom-7 left-1/2 transform -translate-x-1/2 w-24">
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${playerPokemon2.hp / playerPokemon2.maxHp > 0.5 ? 'bg-green-500' : playerPokemon2.hp / playerPokemon2.maxHp > 0.2 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${(playerPokemon2.hp / playerPokemon2.maxHp) * 100}%` }}
                  ></div>
                </div>
                <div className="text-xs text-white mt-1 text-center">
                  {playerPokemon2.hp}/{playerPokemon2.maxHp}
                </div>
              </div>
            </div>
            <div className="bg-black/70 p-1 px-2 rounded text-xs absolute -bottom-14 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
              {playerPokemon2.name}
            </div>
          </div>
        )}
        
        {/* Opponent's Pokémon 1 */}
        {opponentPokemon1 && (
          <div className={`absolute top-4 right-28 z-10 transition-all duration-300 ${
            opponentPokemon1.isAttacking ? '-translate-x-6 -translate-y-2 scale-110' : 
            opponentPokemon1.isHit ? 'translate-x-[4px] translate-y-[4px]' : ''
          }`}>
            <div className="relative">
              <img 
                src={`https://img.pokemondb.net/sprites/black-white/anim/normal/${opponentPokemon1.name.toLowerCase()}.gif`} 
                alt={opponentPokemon1.name}
                className="h-24 pixelated"
                style={{ transform: "scale(2)", imageRendering: "pixelated" }}
              />
              {opponentPokemon1.isHit && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <img 
                    src="/lovable-uploads/f2ffc07f-b49c-45a9-88f4-df71b8d1dd61.png" 
                    alt="Hit marker" 
                    className="h-16 w-16 animate-pulse" 
                  />
                </div>
              )}
              
              {/* HP Bar */}
              <div className="absolute -bottom-7 left-1/2 transform -translate-x-1/2 w-24">
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${opponentPokemon1.hp / opponentPokemon1.maxHp > 0.5 ? 'bg-green-500' : opponentPokemon1.hp / opponentPokemon1.maxHp > 0.2 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${(opponentPokemon1.hp / opponentPokemon1.maxHp) * 100}%` }}
                  ></div>
                </div>
                <div className="text-xs text-white mt-1 text-center">
                  {opponentPokemon1.hp}/{opponentPokemon1.maxHp}
                </div>
              </div>
              
              {/* Target button for selecting this Pokémon to attack */}
              {selectedMove && selectedAttacker && turn === "player" && !isAnimating && (
                <button
                  onClick={() => selectTarget("opponent1")}
                  className="absolute -bottom-14 left-1/2 transform -translate-x-1/2 bg-degen-red text-white text-xs px-2 py-1 rounded-full animate-pulse"
                >
                  TARGET
                </button>
              )}
            </div>
            <div className="bg-black/70 p-1 px-2 rounded text-xs absolute -bottom-14 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
              {opponentPokemon1.name}
            </div>
          </div>
        )}
        
        {/* Opponent's Pokémon 2 */}
        {opponentPokemon2 && (
          <div className={`absolute top-4 right-4 z-10 transition-all duration-300 ${
            opponentPokemon2.isAttacking ? '-translate-x-6 -translate-y-2 scale-110' : 
            opponentPokemon2.isHit ? 'translate-x-[4px] translate-y-[4px]' : ''
          }`}>
            <div className="relative">
              <img 
                src={`https://img.pokemondb.net/sprites/black-white/anim/normal/${opponentPokemon2.name.toLowerCase()}.gif`} 
                alt={opponentPokemon2.name}
                className="h-24 pixelated"
                style={{ transform: "scale(2)", imageRendering: "pixelated" }}
              />
              {opponentPokemon2.isHit && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <img 
                    src="/lovable-uploads/f2ffc07f-b49c-45a9-88f4-df71b8d1dd61.png" 
                    alt="Hit marker" 
                    className="h-16 w-16 animate-pulse" 
                  />
                </div>
              )}
              
              {/* HP Bar */}
              <div className="absolute -bottom-7 left-1/2 transform -translate-x-1/2 w-24">
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${opponentPokemon2.hp / opponentPokemon2.maxHp > 0.5 ? 'bg-green-500' : opponentPokemon2.hp / opponentPokemon2.maxHp > 0.2 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${(opponentPokemon2.hp / opponentPokemon2.maxHp) * 100}%` }}
                  ></div>
                </div>
                <div className="text-xs text-white mt-1 text-center">
                  {opponentPokemon2.hp}/{opponentPokemon2.maxHp}
                </div>
              </div>
              
              {/* Target button for selecting this Pokémon to attack */}
              {selectedMove && selectedAttacker && turn === "player" && !isAnimating && (
                <button
                  onClick={() => selectTarget("opponent2")}
                  className="absolute -bottom-14 left-1/2 transform -translate-x-1/2 bg-degen-red text-white text-xs px-2 py-1 rounded-full animate-pulse"
                >
                  TARGET
                </button>
              )}
            </div>
            <div className="bg-black/70 p-1 px-2 rounded text-xs absolute -bottom-14 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
              {opponentPokemon2.name}
            </div>
          </div>
        )}
        
        {/* Battle platform background */}
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-r from-degen-gray-dark to-degen-gray rounded-b-xl"></div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Player's Pokémon panels (2 separate panels for doubles battle) */}
        <div className="col-span-1 grid grid-cols-1 gap-3">
          {/* Pokémon 1 */}
          {playerPokemon1 && (
            <Card className="bg-degen-gray border-white/10 p-3 glass-card slide-in stagger-1">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-solana">{playerPokemon1.name}</h3>
                  <span className="text-xs text-white/60">Your Pokémon</span>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>HP</span>
                    <span>{playerPokemon1.hp}/{playerPokemon1.maxHp}</span>
                  </div>
                  <Progress 
                    value={(playerPokemon1.hp / playerPokemon1.maxHp) * 100} 
                    className={cn("h-2 bg-white/10", {
                      "animate-pulse": playerPokemon1.isHit
                    })}
                  />
                </div>
                
                <div className="pt-1">
                  <h4 className="text-sm text-white/70 mb-1">Moves:</h4>
                  <div className="grid grid-cols-2 gap-1">
                    {playerPokemon1.moves.map((move) => (
                      <Button
                        key={move}
                        onClick={() => selectMove(move, "pokemon1")}
                        disabled={
                          turn !== "player" || 
                          isBattleOver || 
                          isAnimating || 
                          selectedMove !== null || 
                          !playerPokemon1
                        }
                        className={`bg-degen-gray-light hover:bg-degen-purple/30 border border-white/5 text-xs ${
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
            </Card>
          )}
          
          {/* Pokémon 2 */}
          {playerPokemon2 && (
            <Card className="bg-degen-gray border-white/10 p-3 glass-card slide-in stagger-2">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-solana">{playerPokemon2.name}</h3>
                  <span className="text-xs text-white/60">Your Pokémon</span>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>HP</span>
                    <span>{playerPokemon2.hp}/{playerPokemon2.maxHp}</span>
                  </div>
                  <Progress 
                    value={(playerPokemon2.hp / playerPokemon2.maxHp) * 100} 
                    className={cn("h-2 bg-white/10", {
                      "animate-pulse": playerPokemon2.isHit
                    })}
                  />
                </div>
                
                <div className="pt-1">
                  <h4 className="text-sm text-white/70 mb-1">Moves:</h4>
                  <div className="grid grid-cols-2 gap-1">
                    {playerPokemon2.moves.map((move) => (
                      <Button
                        key={move}
                        onClick={() => selectMove(move, "pokemon2")}
                        disabled={
                          turn !== "player" || 
                          isBattleOver || 
                          isAnimating || 
                          selectedMove !== null || 
                          !playerPokemon2
                        }
                        className={`bg-degen-gray-light hover:bg-degen-purple/30 border border-white/5 text-xs ${
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
            </Card>
          )}
        </div>
        
        {/* Battle Log */}
        <Card className="col-span-1 bg-black/30 border-white/10 p-4 glass-card slide-up stagger-3">
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
                    ? selectedMove 
                      ? "Select Target" 
                      : isAnimating ? "Attacking..." : "Your Turn" 
                    : "Opponent's Turn"}
                </Button>
              </div>
            )}
          </div>
        </Card>
        
        {/* Opponent's Pokémon Stats */}
        <div className="col-span-1 grid grid-cols-1 gap-3">
          {/* Opponent Pokémon 1 */}
          {opponentPokemon1 && (
            <Card className="bg-degen-gray border-white/10 p-3 glass-card slide-in stagger-4" style={{ animationDirection: 'reverse' }}>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-degen-pink">{opponentPokemon1.name}</h3>
                  <span className="text-xs text-white/60">Opponent</span>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>HP</span>
                    <span>{opponentPokemon1.hp}/{opponentPokemon1.maxHp}</span>
                  </div>
                  <Progress 
                    value={(opponentPokemon1.hp / opponentPokemon1.maxHp) * 100} 
                    className={cn("h-2 bg-white/10", {
                      "animate-pulse": opponentPokemon1.isHit
                    })}
                  />
                </div>
                
                <div className="pt-2">
                  <h4 className="text-sm text-white/70 mb-1">Stats:</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2 bg-black/20 rounded-md p-1.5">
                      <Shield className="h-3 w-3 text-degen-blue" />
                      <span className="text-xs">DEF: {opponentPokemon1.stats.defense}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-black/20 rounded-md p-1.5">
                      <Zap className="h-3 w-3 text-degen-yellow" />
                      <span className="text-xs">SPD: {opponentPokemon1.stats.speed}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-black/20 rounded-md p-1.5">
                      <Sword className="h-3 w-3 text-degen-red" />
                      <span className="text-xs">ATK: {opponentPokemon1.stats.attack}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-black/20 rounded-md p-1.5">
                      <Share2 className="h-3 w-3 text-degen-purple" />
                      <span className="text-xs">SPC: {opponentPokemon1.stats.special}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}
          
          {/* Opponent Pokémon 2 */}
          {opponentPokemon2 && (
            <Card className="bg-degen-gray border-white/10 p-3 glass-card slide-in stagger-5" style={{ animationDirection: 'reverse' }}>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-degen-pink">{opponentPokemon2.name}</h3>
                  <span className="text-xs text-white/60">Opponent</span>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>HP</span>
                    <span>{opponentPokemon2.hp}/{opponentPokemon2.maxHp}</span>
                  </div>
                  <Progress 
                    value={(opponentPokemon2.hp / opponentPokemon2.maxHp) * 100} 
                    className={cn("h-2 bg-white/10", {
                      "animate-pulse": opponentPokemon2.isHit
                    })}
                  />
                </div>
                
                <div className="pt-2">
                  <h4 className="text-sm text-white/70 mb-1">Stats:</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2 bg-black/20 rounded-md p-1.5">
                      <Shield className="h-3 w-3 text-degen-blue" />
                      <span className="text-xs">DEF: {opponentPokemon2.stats.defense}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-black/20 rounded-md p-1.5">
                      <Zap className="h-3 w-3 text-degen-yellow" />
                      <span className="text-xs">SPD: {opponentPokemon2.stats.speed}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-black/20 rounded-md p-1.5">
                      <Sword className="h-3 w-3 text-degen-red" />
                      <span className="text-xs">ATK: {opponentPokemon2.stats.attack}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-black/20 rounded-md p-1.5">
                      <Share2 className="h-3 w-3 text-degen-purple" />
                      <span className="text-xs">SPC: {opponentPokemon2.stats.special}</span>
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
              {playerTeam.map((pokemon) => (
                <div 
                  key={pokemon.name}
                  className={`text-center p-2 rounded-md text-xs ${
                    pokemon.hp === 0 
                      ? 'bg-red-900/20 text-white/30' 
                      : playerPokemon1?.name === pokemon.name || playerPokemon2?.name === pokemon.name
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
                      : opponentPokemon1?.name === pokemon.name || opponentPokemon2?.name === pokemon.name
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
