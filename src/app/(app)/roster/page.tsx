
"use client";

import Image from "next/image";
import Link from "next/link";
import * as React from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart, Globe, HeartPulse, PlusCircle, Trash, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";


const PlayerCard = ({ player, onSelect, isSelected }: { player: any, onSelect: (player: any) => void, isSelected: boolean }) => (
  <Card className="text-center hover:shadow-xl transition-shadow overflow-hidden bg-card border-border/50">
    <CardHeader className="p-0 relative">
        <Image
          src={player.imageUrl || "https://placehold.co/400x400.png"}
          alt={player.name}
          width={400}
          height={400}
          className="aspect-square object-cover"
          data-ai-hint={player.imageHint || "athlete portrait"}
        />
        <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full h-10 w-10 flex items-center justify-center text-xl font-bold">
          {player.number}
        </div>
        <Button 
            size="icon"
            variant={isSelected ? "destructive" : "secondary"}
            className="absolute top-2 left-2 rounded-full h-8 w-8"
            onClick={() => onSelect(player)}
        >
            {isSelected ? <X className="h-4 w-4" /> : <PlusCircle className="h-4 w-4" />}
            <span className="sr-only">{isSelected ? 'Remove from comparison' : 'Add to comparison'}</span>
        </Button>
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
            <CardTitle className="text-2xl text-white">{player.name}</CardTitle>
            <p className="text-white/80">{player.position}</p>
        </div>
    </CardHeader>
    <CardContent className="p-4 space-y-2 text-left">
       <div className="flex items-center gap-2 text-muted-foreground">
        <Globe className="h-4 w-4"/>
        <span>Nationality: {player.nationality}</span>
       </div>
        <div className="flex items-center gap-2 text-muted-foreground">
            <BarChart className="h-4 w-4"/>
            <span>{player.apps || 0} Apps, {player.goals || 0} Goals, {player.assists || 0} Assists</span>
        </div>
        {player.status && player.status !== 'Available' && (
            <div className="flex items-center gap-2">
                <HeartPulse className="h-4 w-4 text-destructive"/>
                <Badge variant="destructive">{player.status}</Badge>
            </div>
        )}
    </CardContent>
    <CardFooter className="p-4 pt-0">
        <Button asChild variant="outline" className="w-full">
            <Link href={`/roster/${player.id}`}>View Profile <ArrowRight className="ml-2"/></Link>
        </Button>
    </CardFooter>
  </Card>
);

export default function RosterPage() {
  const [menPlayers, setMenPlayers] = React.useState<any[]>([]);
  const [womenPlayers, setWomenPlayers] = React.useState<any[]>([]);
  const [selectedPlayers, setSelectedPlayers] = React.useState<any[]>([]);
  const { toast } = useToast();
  const router = useRouter();

  React.useEffect(() => {
    const menQuery = query(collection(db, "players"), where("squad", "==", "Men's First Team"));
    const womenQuery = query(collection(db, "players"), where("squad", "==", "Women's First Team"));

    const unsubMen = onSnapshot(menQuery, (snapshot) => {
      setMenPlayers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const unsubWomen = onSnapshot(womenQuery, (snapshot) => {
      setWomenPlayers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubMen();
      unsubWomen();
    };
  }, []);

  const handleSelectPlayer = (player: any) => {
    setSelectedPlayers(prev => {
        const isAlreadySelected = prev.find(p => p.id === player.id);
        if (isAlreadySelected) {
            return prev.filter(p => p.id !== player.id);
        }
        if (prev.length >= 2) {
            toast({
                title: "Maximum Players Selected",
                description: "You can only compare two players at a time.",
                variant: "destructive"
            });
            return prev;
        }
        return [...prev, player];
    });
  };

  const handleCompareClick = () => {
    if (selectedPlayers.length !== 2) {
        toast({
            title: "Select Two Players",
            description: "Please select exactly two players to compare.",
            variant: "destructive"
        });
        return;
    }
    const playerIds = selectedPlayers.map(p => p.id).join(',');
    router.push(`/roster/compare?players=${playerIds}`);
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Player Roster</h1>
        <p className="text-muted-foreground">Meet the talented individuals who make up our team. Select two players to compare their stats.</p>
      </div>
      <Tabs defaultValue="men" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="men">Men's Team</TabsTrigger>
          <TabsTrigger value="women">Women's Team</TabsTrigger>
        </TabsList>
        <TabsContent value="men">
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {menPlayers.map((player) => (
              <PlayerCard key={player.id} player={player} onSelect={handleSelectPlayer} isSelected={!!selectedPlayers.find(p => p.id === player.id)} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="women">
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {womenPlayers.map((player) => (
              <PlayerCard key={player.id} player={player} onSelect={handleSelectPlayer} isSelected={!!selectedPlayers.find(p => p.id === player.id)} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
      {selectedPlayers.length > 0 && (
         <div className="fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-sm border-t p-4 shadow-lg z-50">
            <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <p className="font-semibold hidden sm:block">Comparing:</p>
                    <div className="flex items-center gap-2 flex-wrap justify-center">
                        {selectedPlayers.map(p => (
                            <Badge key={p.id} variant="secondary" className="flex items-center gap-2">
                                {p.name}
                                <Button size="icon" variant="ghost" className="h-4 w-4" onClick={() => handleSelectPlayer(p)}>
                                    <X className="h-3 w-3" />
                                </Button>
                            </Badge>
                        ))}
                         {selectedPlayers.length < 2 && (
                             <span className="text-sm text-muted-foreground">Select one more player...</span>
                        )}
                    </div>
                </div>
                <Button onClick={handleCompareClick} disabled={selectedPlayers.length !== 2} className="w-full sm:w-auto">
                    Compare Players
                </Button>
            </div>
         </div>
      )}
    </div>
  );
}
