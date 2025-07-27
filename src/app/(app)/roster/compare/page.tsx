
"use client";

import Image from "next/image";
import Link from "next/link";
import * as React from "react";
import { useSearchParams } from 'next/navigation'
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, BarChart, Footprints, Heart, CircleDot, ShieldCheck, PersonStanding, TrendingUp, Star } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

const StatBar = ({ label, value1, value2 }: { label: string, value1: number, value2: number }) => {
    const total = Math.max(value1, value2, 1) > 100 ? Math.max(value1, value2) : 100;
    const p1 = (value1 / total) * 100;
    const p2 = (value2 / total) * 100;

    return (
        <div className="w-full">
            <div className="flex justify-between items-center text-sm mb-1">
                <span className="font-bold text-primary">{value1}</span>
                <span className="text-muted-foreground">{label}</span>
                <span className="font-bold text-secondary">{value2}</span>
            </div>
            <div className="flex items-center w-full h-2 md:h-4 rounded-full bg-muted overflow-hidden">
                <div className="bg-primary h-full rounded-l-full text-right transition-all duration-500" style={{ width: `${p1}%` }}></div>
                <div className="bg-secondary h-full rounded-r-full transition-all duration-500" style={{ width: `${p2}%` }}></div>
            </div>
        </div>
    );
};

const StarRating = ({ rating }: { rating: number }) => (
    <div className="flex items-center justify-center">
        {[...Array(5)].map((_, i) => (
            <Star key={i} className={`h-4 w-4 md:h-5 md:w-5 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-500'}`} />
        ))}
    </div>
);

const PlayerCard = ({ player }: { player: any }) => (
    <div className="flex flex-col items-center gap-4 p-4 text-center">
        <Image src={player.imageUrl} alt={player.name} width={100} height={100} className="rounded-full border-4 border-primary" data-ai-hint="athlete portrait"/>
        <div>
            <h2 className="text-2xl md:text-3xl font-bold">{player.name}</h2>
            <p className="text-muted-foreground">{player.position}</p>
        </div>
    </div>
);

export default function ComparePlayersPage() {
    const searchParams = useSearchParams()
    const [players, setPlayers] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const playerIds = searchParams.get('players')?.split(',');
        if (playerIds && playerIds.length === 2) {
            const fetchPlayers = async () => {
                try {
                    const player1Doc = await getDoc(doc(db, "players", playerIds[0]));
                    const player2Doc = await getDoc(doc(db, "players", playerIds[1]));
                    const playersData = [];
                    if (player1Doc.exists()) playersData.push({ id: player1Doc.id, ...player1Doc.data() });
                    if (player2Doc.exists()) playersData.push({ id: player2Doc.id, ...player2Doc.data() });
                    setPlayers(playersData);
                } catch (error) {
                    console.error("Error fetching players:", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchPlayers();
        } else {
            setLoading(false);
        }
    }, [searchParams]);
    
    if (loading) {
        return (
            <div className="max-w-6xl mx-auto p-4">
                 <Skeleton className="h-8 w-32 mb-6" />
                 <div className="grid md:grid-cols-2 gap-8">
                    <Skeleton className="h-[600px] w-full" />
                    <Skeleton className="h-[600px] w-full" />
                 </div>
            </div>
        )
    }

    if (players.length !== 2) {
        return (
            <div className="text-center py-10">
                <p>Could not load players for comparison. Please select two players from the roster.</p>
                <Button asChild variant="link" className="mt-4">
                    <Link href="/roster">Back to Roster</Link>
                </Button>
            </div>
        )
    }

    const [player1, player2] = players;
    const p1_overall = Math.round(Object.values(player1.stats || {}).flatMap((cat: any) => Object.values(cat)).reduce((a: any, b: any) => a + b, 0) / (Object.values(player1.stats || {}).flatMap((cat: any) => Object.values(cat)).length || 1));
    const p2_overall = Math.round(Object.values(player2.stats || {}).flatMap((cat: any) => Object.values(cat)).reduce((a: any, b: any) => a + b, 0) / (Object.values(player2.stats || {}).flatMap((cat: any) => Object.values(cat)).length || 1));

    return (
        <div className="max-w-6xl mx-auto p-4 space-y-6">
            <div>
                <Link href="/roster" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Roster
                </Link>
            </div>
            
            <div className="grid grid-cols-1 md:hidden">
                 <Card>
                    <PlayerCard player={player1} />
                </Card>
                <div className="text-center font-bold text-2xl my-4">VS</div>
                <Card>
                    <PlayerCard player={player2} />
                </Card>
            </div>

            <Card className="hidden md:block">
                <CardContent className="p-0 grid grid-cols-[1fr_auto_1fr] items-center">
                    {/* Player 1 Header */}
                    <div className="flex items-center gap-4 p-4">
                        <Image src={player1.imageUrl} alt={player1.name} width={100} height={100} className="rounded-full border-4 border-primary" data-ai-hint="athlete portrait"/>
                        <div>
                            <h2 className="text-3xl font-bold">{player1.name}</h2>
                            <p className="text-muted-foreground">{player1.position}</p>
                        </div>
                    </div>

                    <Separator orientation="vertical" className="h-24" />

                    {/* Player 2 Header */}
                    <div className="flex items-center justify-end gap-4 p-4 text-right">
                         <div>
                            <h2 className="text-3xl font-bold">{player2.name}</h2>
                            <p className="text-muted-foreground">{player2.position}</p>
                        </div>
                        <Image src={player2.imageUrl} alt={player2.name} width={100} height={100} className="rounded-full border-4 border-secondary" data-ai-hint="athlete portrait"/>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-center">Overall Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <StatBar label="Overall Rating" value1={p1_overall} value2={p2_overall} />
                    <StatBar label="Potential" value1={player1.potential || 0} value2={player2.potential || 0} />
                    <div className="flex justify-between items-center pt-4">
                        <StarRating rating={player1.skillMoves || 0} />
                        <span className="text-muted-foreground text-sm">Skill Moves</span>
                        <StarRating rating={player2.skillMoves || 0} />
                    </div>
                     <div className="flex justify-between items-center">
                        <StarRating rating={player1.weakFoot || 0} />
                        <span className="text-muted-foreground text-sm">Weak Foot</span>
                        <StarRating rating={player2.weakFoot || 0} />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-center">Performance</CardTitle>
                </CardHeader>
                 <CardContent className="space-y-4">
                    <StatBar label="Appearances" value1={player1.apps || 0} value2={player2.apps || 0} />
                    <StatBar label="Goals" value1={player1.goals || 0} value2={player2.goals || 0} />
                    <StatBar label="Assists" value1={player1.assists || 0} value2={player2.assists || 0} />
                </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
                 <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp /> Pace</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <StatBar label="Acceleration" value1={player1.stats?.pace?.acc || 0} value2={player2.stats?.pace?.acc || 0} />
                        <StatBar label="Sprint Speed" value1={player1.stats?.pace?.speed || 0} value2={player2.stats?.pace?.speed || 0} />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><CircleDot /> Shooting</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <StatBar label="Finishing" value1={player1.stats?.shooting?.fin || 0} value2={player2.stats?.shooting?.fin || 0} />
                        <StatBar label="Long Shots" value1={player1.stats?.shooting?.long || 0} value2={player2.stats?.shooting?.long || 0} />
                        <StatBar label="Shot Power" value1={player1.stats?.shooting?.pow || 0} value2={player2.stats?.shooting?.pow || 0} />
                        <StatBar label="Penalties" value1={player1.stats?.shooting?.pen || 0} value2={player2.stats?.shooting?.pen || 0} />
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><Heart /> Passing</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <StatBar label="Short Passing" value1={player1.stats?.passing?.short || 0} value2={player2.stats?.passing?.short || 0} />
                        <StatBar label="Long Passing" value1={player1.stats?.passing?.long || 0} value2={player2.stats?.passing?.long || 0} />
                        <StatBar label="Crossing" value1={player1.stats?.passing?.cross || 0} value2={player2.stats?.passing?.cross || 0} />
                        <StatBar label="Curve" value1={player1.stats?.passing?.curve || 0} value2={player2.stats?.passing?.curve || 0} />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><Footprints /> Dribbling</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <StatBar label="Ball Control" value1={player1.stats?.dribbling?.ctrl || 0} value2={player2.stats?.dribbling?.ctrl || 0} />
                        <StatBar label="Agility" value1={player1.stats?.dribbling?.agi || 0} value2={player2.stats?.dribbling?.agi || 0} />
                        <StatBar label="Balance" value1={player1.stats?.dribbling?.bal || 0} value2={player2.stats?.dribbling?.bal || 0} />
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><ShieldCheck /> Defense</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <StatBar label="Marking" value1={player1.stats?.defense?.mark || 0} value2={player2.stats?.defense?.mark || 0} />
                        <StatBar label="Stand Tackle" value1={player1.stats?.defense?.stand || 0} value2={player2.stats?.defense?.stand || 0} />
                        <StatBar label="Slide Tackle" value1={player1.stats?.defense?.slide || 0} value2={player2.stats?.defense?.slide || 0} />
                        <StatBar label="Interceptions" value1={player1.stats?.defense?.int || 0} value2={player2.stats?.defense?.int || 0} />
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><PersonStanding /> Physicality</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <StatBar label="Strength" value1={player1.stats?.physicality?.str || 0} value2={player2.stats?.physicality?.str || 0} />
                        <StatBar label="Stamina" value1={player1.stats?.physicality?.stam || 0} value2={player2.stats?.physicality?.stam || 0} />
                        <StatBar label="Aggression" value1={player1.stats?.physicality?.agg || 0} value2={player2.stats?.physicality?.agg || 0} />
                        <StatBar label="Jumping" value1={player1.stats?.physicality?.jump || 0} value2={player2.stats?.physicality?.jump || 0} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
