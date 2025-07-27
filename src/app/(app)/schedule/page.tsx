
"use client";

import Image from "next/image";
import * as React from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import YouTubeEmbed from "@/components/youtube-embed";
import { Tv, Video } from "lucide-react";

// Function to extract YouTube video ID from various URL formats
const getYouTubeId = (url: string) => {
  if (!url) return '';
  let ID = '';
  try {
    const urlObj = new URL(url);
    ID = urlObj.searchParams.get('v') || '';
    if (urlObj.hostname === 'youtu.be') {
      ID = urlObj.pathname.slice(1);
    }
  } catch (e) {
    console.error("Invalid youtube URL", e);
    return '';
  }
  return ID;
};

const MatchCard = ({ match }: { match: any }) => (
  <Card className="hover:shadow-lg transition-shadow">
    <CardHeader>
      <CardTitle className="flex items-center justify-between">
        <span>vs {match.opponent}</span>
        <Badge variant={match.venue === 'Home' ? 'default' : 'secondary'}>{match.venue}</Badge>
      </CardTitle>
      <CardDescription>{match.competition} - <span className="font-semibold">{match.team}</span></CardDescription>
    </CardHeader>
    <CardContent className="flex items-center justify-between">
      <div className="flex flex-col items-center gap-2">
        <Image src={match.chmLogo || "https://placehold.co/64x64.png"} alt="Our Team Logo" width={64} height={64} data-ai-hint="soccer logo" />
        <span className="font-semibold text-center">CHM FC</span>
      </div>
      
      {match.score ? (
        <div className="text-center">
            <span className={`text-3xl font-bold px-2 py-1 rounded-md ${match.result === 'W' ? 'text-green-600' : match.result === 'L' ? 'text-red-600' : 'text-gray-600'}`}>
                {match.score}
            </span>
            <Badge variant="outline" className={`mt-2 ${match.result === 'W' ? 'border-green-600' : match.result === 'L' ? 'border-red-600' : 'border-gray-600'}`}>
                {match.result}
            </Badge>
        </div>
      ) : (
        <div className="text-center">
            <p className="text-xl font-bold">{match.time}</p>
            <p className="text-sm text-muted-foreground">GMT</p>
        </div>
      )}

      <div className="flex flex-col items-center gap-2">
        <Image src={match.opponentLogo || "https://placehold.co/64x64.png"} alt={`${match.opponent} Logo`} width={64} height={64} data-ai-hint="sports logo" />
        <span className="font-semibold text-center">{match.opponent}</span>
      </div>
    </CardContent>
    <CardFooter>
      <p className="text-sm text-muted-foreground w-full text-center">{new Date(match.date).toLocaleDateString()}</p>
    </CardFooter>
  </Card>
);

const HighlightCard = ({ highlight }: { highlight: any }) => (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <CardContent className="p-0">
             <YouTubeEmbed embedId={getYouTubeId(highlight.youtubeLink)} />
        </CardContent>
        <CardHeader>
            <CardTitle>{highlight.title}</CardTitle>
            <CardDescription>{new Date(highlight.date).toLocaleDateString()}</CardDescription>
        </CardHeader>
    </Card>
);


export default function SchedulePage() {
  const [upcomingMatches, setUpcomingMatches] = React.useState<any[]>([]);
  const [pastResults, setPastResults] = React.useState<any[]>([]);
  const [liveMatch, setLiveMatch] = React.useState<any>(null);
  const [highlights, setHighlights] = React.useState<any[]>([]);

  React.useEffect(() => {
    const upcomingQuery = query(collection(db, "matches"), where("status", "==", "Upcoming"));
    const pastQuery = query(collection(db, "matches"), where("status", "==", "Past"));
    const liveQuery = query(collection(db, "matches"), where("status", "==", "Live"));
    const highlightsQuery = query(collection(db, "highlights"));


    const unsubUpcoming = onSnapshot(upcomingQuery, (snapshot) => {
      setUpcomingMatches(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    });
    
    const unsubPast = onSnapshot(pastQuery, (snapshot) => {
      setPastResults(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    });
    
    const unsubLive = onSnapshot(liveQuery, (snapshot) => {
      setLiveMatch(snapshot.empty ? null : {id: snapshot.docs[0].id, ...snapshot.docs[0].data()});
    });

    const unsubHighlights = onSnapshot(highlightsQuery, (snapshot) => {
        setHighlights(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });


    return () => {
      unsubUpcoming();
      unsubPast();
      unsubLive();
      unsubHighlights();
    };
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Scores & Schedule</h1>
      </div>
      
      {liveMatch && (
        <Card className="bg-card/50 border-primary border-2">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                    <Tv className="animate-pulse" />
                    <span>Live Match: CHM FC vs {liveMatch.opponent}</span>
                </CardTitle>
                <CardDescription>The match is currently live{liveMatch.youtubeLink && '. Watch the stream below!'}</CardDescription>
            </CardHeader>
            {liveMatch.youtubeLink && (
              <CardContent>
                  <YouTubeEmbed embedId={getYouTubeId(liveMatch.youtubeLink)} />
              </CardContent>
            )}
            {!liveMatch.youtubeLink && (
                 <CardContent>
                    <MatchCard match={liveMatch} />
                </CardContent>
            )}
        </Card>
      )}

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upcoming">Upcoming Matches</TabsTrigger>
          <TabsTrigger value="results">Past Results</TabsTrigger>
          <TabsTrigger value="highlights">Highlights</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming">
          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
            {upcomingMatches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="results">
          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
            {pastResults.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="highlights">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {highlights.length > 0 ? highlights.map((highlight) => (
                    <HighlightCard key={highlight.id} highlight={highlight} />
                )) : (
                    <p className="text-muted-foreground col-span-full text-center py-8">No highlights available yet.</p>
                )}
            </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
