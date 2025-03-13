
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { User, Plus, X, Check, ChevronDown, ChevronUp } from 'lucide-react';

const SAMPLE_POKEMON = [
  "Bulbasaur", "Charizard", "Blastoise", "Pikachu", 
  "Jigglypuff", "Meowth", "Psyduck", "Gengar",
  "Onix", "Electrode", "Exeggutor", "Hitmonlee",
  "Weezing", "Chansey", "Kangaskhan", "Starmie",
  "Scyther", "Jynx", "Electabuzz", "Magmar",
  "Gyarados", "Lapras", "Eevee", "Porygon",
  "Snorlax", "Articuno", "Zapdos", "Moltres",
  "Dragonite", "Mewtwo", "Mew"
];

const TeamBuilder = ({ onTeamCreate }: { onTeamCreate: (team: string[]) => void }) => {
  const [teamName, setTeamName] = useState('My Degen Team');
  const [team, setTeam] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [expanded, setExpanded] = useState(true);
  const { toast } = useToast();

  const filteredPokemon = SAMPLE_POKEMON.filter(
    pokemon => pokemon.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToTeam = (pokemon: string) => {
    if (team.length >= 6) {
      toast({
        title: "Team is full",
        description: "You can only have 6 Pokémon in your team.",
        variant: "destructive"
      });
      return;
    }
    
    if (team.includes(pokemon)) {
      toast({
        title: "Already added",
        description: `${pokemon} is already in your team.`,
        variant: "destructive"
      });
      return;
    }
    
    setTeam([...team, pokemon]);
    toast({
      title: "Added to team",
      description: `${pokemon} was added to your team.`,
    });
  };

  const removeFromTeam = (pokemon: string) => {
    setTeam(team.filter(p => p !== pokemon));
    toast({
      title: "Removed from team",
      description: `${pokemon} was removed from your team.`,
    });
  };

  const handleCreateTeam = () => {
    if (team.length === 0) {
      toast({
        title: "Empty team",
        description: "You need to add at least one Pokémon to your team.",
        variant: "destructive"
      });
      return;
    }

    onTeamCreate(team);
    toast({
      title: "Team created",
      description: `Your team "${teamName}" is ready for battle!`,
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto glass-card rounded-xl p-5 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <User className="h-5 w-5 text-degen-purple" />
          <h2 className="text-xl font-bold text-gradient-degen">Team Builder</h2>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setExpanded(!expanded)}
          className="h-8 w-8"
        >
          {expanded ? <ChevronUp /> : <ChevronDown />}
        </Button>
      </div>
      
      {expanded && (
        <>
          <div className="mb-6">
            <Input
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="glass border-degen-purple/50 focus:border-degen-purple bg-black/20 text-white"
              placeholder="Enter team name"
            />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card className="bg-black/20 border-white/10 p-4">
              <h3 className="text-sm font-medium text-white/70 mb-3">Your Team ({team.length}/6)</h3>
              <ScrollArea className="h-48">
                {team.length === 0 ? (
                  <p className="text-center text-white/50 my-4">Add Pokémon to your team</p>
                ) : (
                  <div className="space-y-2">
                    {team.map((pokemon) => (
                      <div key={pokemon} className="flex items-center justify-between p-2 rounded-md bg-degen-gray">
                        <span className="text-white">{pokemon}</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => removeFromTeam(pokemon)}
                          className="h-6 w-6 text-white/70 hover:text-white hover:bg-red-500/20"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </Card>
            
            <Card className="bg-black/20 border-white/10 p-4">
              <div className="mb-3">
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="glass border-white/10 focus:border-degen-blue bg-black/20 text-white"
                  placeholder="Search Pokémon"
                />
              </div>
              <ScrollArea className="h-48">
                <div className="grid grid-cols-2 gap-2">
                  {filteredPokemon.map((pokemon) => (
                    <Button
                      key={pokemon}
                      variant="outline"
                      size="sm"
                      onClick={() => addToTeam(pokemon)}
                      disabled={team.includes(pokemon)}
                      className={`justify-start text-left ${
                        team.includes(pokemon) 
                          ? 'bg-degen-purple/20 border-degen-purple/40 text-white/50' 
                          : 'bg-black/20 border-white/10 hover:bg-degen-blue/20 hover:border-degen-blue/40'
                      }`}
                    >
                      <Plus className="h-3 w-3 mr-2" />
                      {pokemon}
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </Card>
          </div>
          
          <div className="flex justify-center">
            <Button 
              onClick={handleCreateTeam}
              className="btn-glow bg-gradient-to-r from-degen-purple to-degen-blue hover:opacity-90 transition-opacity duration-300"
            >
              <Check className="h-5 w-5 mr-2" />
              Create Team
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default TeamBuilder;
