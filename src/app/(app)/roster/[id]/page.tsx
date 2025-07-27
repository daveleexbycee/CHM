
"use client";

import Image from "next/image";
import Link from "next/link";
import * as React from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowLeft,
  BarChart,
  Calendar,
  Footprints,
  Globe,
  Heart,
  Shirt,
  Star,
  PersonStanding,
  CircleDot,
  ShieldCheck,
  TrendingUp,
  Ruler,
  FileText,
  HeartPulse,
  GraduationCap
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

const StarRating = ({ rating }: { rating: number }) => (
    <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
            <Star key={i} className={`h-5 w-5 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-500'}`} />
        ))}
    </div>
);

const AttributeGrid = ({ title, icon, attributes }: { title: string, icon: React.ReactNode, attributes: {label: string, value: number}[]}) => (
    <div className="space-y-2">
        <h4 className="flex items-center gap-2 text-lg font-semibold text-primary">
            {icon}
            {title}
        </h4>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
            {attributes.map(attr => (
                <div key={attr.label} className="flex justify-between">
                    <span>{attr.label}</span>
                    <span className="font-medium">{attr.value || 0}</span>
                </div>
            ))}
        </div>
    </div>
)

const StatCard = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: any }) => (
    <Card className="bg-card/50 text-center p-4">
        <div className="text-primary">{icon}</div>
        <p className="text-2xl font-bold">{value || 0}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
    </Card>
);

export default function PlayerProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const [player, setPlayer] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (params.id) {
        const playerDoc = doc(db, "players", params.id);
        const unsubscribe = onSnapshot(playerDoc, (doc) => {
            if (doc.exists()) {
                setPlayer({ id: doc.id, ...doc.data() });
            } else {
                setPlayer(null);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }
  }, [params.id]);

  if (loading) {
      return (
          <div className="container mx-auto p-4 space-y-6">
              <Skeleton className="h-8 w-32" />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-1 space-y-6">
                      <Skeleton className="w-full h-[500px] rounded-lg" />
                      <Skeleton className="w-full h-[150px] rounded-lg" />
                  </div>
                  <div className="lg:col-span-2 space-y-6">
                      <Skeleton className="h-16 w-1/2" />
                      <Skeleton className="w-full h-[400px] rounded-lg" />
                      <Skeleton className="w-full h-[200px] rounded-lg" />
                  </div>
              </div>
          </div>
      )
  }

  if (!player) {
    return <div>Player not found</div>;
  }

  const overall = Math.round(
    Object.values(player.stats || {}).flatMap((cat: any) => Object.values(cat)).reduce((a: any, b: any) => a + b, 0) /
    (Object.values(player.stats || {}).flatMap((cat: any) => Object.values(cat)).length || 1)
  );
  
  const birthDate = player.birthDate ? new Date(player.birthDate) : null;
  const age = birthDate ? new Date().getFullYear() - birthDate.getFullYear() : 'N/A';

  return (
    <div className="container mx-auto p-4 space-y-6">
        <div>
            <Link href="/roster" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                <ArrowLeft className="h-4 w-4" />
                Back to Roster
            </Link>
        </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="md:col-span-1 space-y-6">
            <Card className="overflow-hidden relative">
                <Image
                    src={player.imageUrl || "https://placehold.co/400x600.png"}
                    alt={player.name}
                    width={400}
                    height={600}
                    className="w-full object-cover"
                    data-ai-hint={player.imageHint || "athlete portrait"}
                />
                <div className="absolute top-4 right-4 bg-primary text-primary-foreground rounded-full h-16 w-16 flex items-center justify-center text-3xl font-bold border-4 border-background">
                    {overall}
                </div>
                 {player.status && player.status !== 'Available' && (
                    <div className="absolute top-4 left-4">
                        <Badge variant="destructive" className="text-lg py-2 px-4">
                            <HeartPulse className="h-5 w-5 mr-2"/>
                            {player.status}
                        </Badge>
                    </div>
                )}
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><FileText className="text-primary"/> Biography</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">{player.bio || 'No biography available.'}</p>
                </CardContent>
           </Card>
        </div>
        
        {/* Right Column */}
        <div className="md:col-span-2 space-y-6">
            <div>
                <h1 className="text-4xl md:text-5xl font-bold text-primary">{player.name}</h1>
                <p className="text-xl md:text-2xl text-muted-foreground">{player.position}</p>
                <div className="mt-4 space-y-2 text-muted-foreground">
                    <div className="flex items-center gap-2"><Globe className="h-5 w-5 text-primary"/> Nationality: {player.nationality}</div>
                    <div className="flex items-center gap-2"><Calendar className="h-5 w-5 text-primary"/> Born: {player.birthDate} ({age} years old)</div>
                    <div className="flex items-center gap-2"><Ruler className="h-5 w-5 text-primary"/> Height: {player.height || 'N/A'}</div>
                    <div className="flex items-center gap-2"><GraduationCap className="h-5 w-5 text-primary"/> Year: {player.year || 'N/A'}</div>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><BarChart className="text-primary"/> Player Attributes</CardTitle>
                    <CardDescription>A detailed breakdown of the player's intrinsic abilities.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div className="bg-card/50 p-3 rounded-lg">
                            <p className="text-sm text-muted-foreground">OVERALL</p>
                            <p className="text-3xl font-bold text-primary">{overall}</p>
                        </div>
                        <div className="bg-card/50 p-3 rounded-lg">
                            <p className="text-sm text-muted-foreground">POTENTIAL</p>
                            <p className="text-3xl font-bold">{player.potential || 'N/A'}</p>
                        </div>
                         <div className="bg-card/50 p-3 rounded-lg">
                            <p className="text-sm text-muted-foreground">SKILL MOVES</p>
                            <StarRating rating={player.skillMoves || 0} />
                        </div>
                         <div className="bg-card/50 p-3 rounded-lg">
                            <p className="text-sm text-muted-foreground">WEAK FOOT</p>
                            <StarRating rating={player.weakFoot || 0} />
                        </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AttributeGrid title="Pace" icon={<TrendingUp />} attributes={[ {label: 'Acceleration', value: player.stats?.pace?.acc}, {label: 'Sprint Speed', value: player.stats?.pace?.speed} ]} />
                        <AttributeGrid title="Shooting" icon={<CircleDot />} attributes={[ {label: 'Finishing', value: player.stats?.shooting?.fin}, {label: 'Long Shots', value: player.stats?.shooting?.long}, {label: 'Shot Power', value: player.stats?.shooting?.pow}, {label: 'Penalties', value: player.stats?.shooting?.pen} ]} />
                        <AttributeGrid title="Passing" icon={<Heart />} attributes={[ {label: 'Short Passing', value: player.stats?.passing?.short}, {label: 'Long Passing', value: player.stats?.passing?.long}, {label: 'Crossing', value: player.stats?.passing?.cross}, {label: 'Curve', value: player.stats?.passing?.curve} ]} />
                        <AttributeGrid title="Dribbling" icon={<Footprints />} attributes={[ {label: 'Ball Control', value: player.stats?.dribbling?.ctrl}, {label: 'Agility', value: player.stats?.dribbling?.agi}, {label: 'Balance', value: player.stats?.dribbling?.bal} ]} />
                        <AttributeGrid title="Defense" icon={<ShieldCheck />} attributes={[ {label: 'Marking', value: player.stats?.defense?.mark}, {label: 'Standing Tackle', value: player.stats?.defense?.stand}, {label: 'Sliding Tackle', value: player.stats?.defense?.slide}, {label: 'Interceptions', value: player.stats?.defense?.int} ]} />
                        <AttributeGrid title="Physicality" icon={<PersonStanding />} attributes={[ {label: 'Strength', value: player.stats?.physicality?.str}, {label: 'Stamina', value: player.stats?.physicality?.stam}, {label: 'Aggression', value: player.stats?.physicality?.agg}, {label: 'Jumping', value: player.stats?.physicality?.jump} ]} />
                    </div>

                    <Separator />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                             <h4 className="flex items-center gap-2 text-lg font-semibold text-primary mb-2">
                                <BarChart /> Work Rate
                            </h4>
                            <div className="flex justify-between text-sm"><span>Attacking</span> <span className={`font-bold ${player.workRate?.attacking === 'High' ? 'text-green-400' : 'text-yellow-400'}`}>{player.workRate?.attacking || 'N/A'}</span></div>
                            <div className="flex justify-between text-sm"><span>Defensive</span> <span className={`font-bold ${player.workRate?.defensive === 'High' ? 'text-green-400' : player.workRate?.defensive === 'Medium' ? 'text-yellow-400' : 'text-red-400'}`}>{player.workRate?.defensive || 'N/A'}</span></div>
                        </div>
                         <div>
                             <h4 className="flex items-center gap-2 text-lg font-semibold text-primary mb-2">
                                <Star /> Traits & Specialities
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {(player.traits || []).map((trait: string) => (
                                    <div key={trait} className="bg-accent text-accent-foreground text-xs font-medium px-2 py-1 rounded-full">{trait}</div>
                                ))}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><BarChart className="text-primary"/> Performance Statistics</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    <StatCard icon={<Shirt className="h-8 w-8 mx-auto" />} label="Appearances" value={player.apps} />
                    <StatCard icon={<CircleDot className="h-8 w-8 mx-auto" />} label="Goals" value={player.goals} />
                    <StatCard icon={<Heart className="h-8 w-8 mx-auto" />} label="Assists" value={player.assists} />
                    <StatCard icon={<div className="h-8 w-8 mx-auto flex items-center justify-center"><div className="w-5 h-7 bg-yellow-400 rounded-sm"></div></div>} label="Yellow Cards" value={player.yellowCards} />
                    <StatCard icon={<div className="h-8 w-8 mx-auto flex items-center justify-center"><div className="w-5 h-7 bg-red-600 rounded-sm"></div></div>} label="Red Cards" value={player.redCards} />
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
