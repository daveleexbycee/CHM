
"use client";

import * as React from "react";
import { collection, onSnapshot, doc, updateDoc, arrayUnion, getDoc, runTransaction } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

export default function PollsPage() {
    const [polls, setPolls] = React.useState<any[]>([]);
    const { user } = useAuth();
    const { toast } = useToast();
    const [votedPolls, setVotedPolls] = React.useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = React.useState<string | null>(null);

    React.useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "polls"), (snapshot) => {
            const pollsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setPolls(pollsData.filter(p => p.isOpen));
        });
        return () => unsubscribe();
    }, []);

    React.useEffect(() => {
        const checkVotedStatus = async () => {
            if (!user || polls.length === 0) return;
            const voted: string[] = [];
            for (const poll of polls) {
                const voteDocRef = doc(db, "polls", poll.id, "votes", user.uid);
                const voteDoc = await getDoc(voteDocRef);
                if (voteDoc.exists()) {
                    voted.push(poll.id);
                }
            }
            setVotedPolls(voted);
        };
        checkVotedStatus();
    }, [user, polls]);

    const handleVote = async (pollId: string, optionIndex: number) => {
        if (!user) {
            toast({ title: "Please log in to vote.", variant: "destructive" });
            return;
        }

        if (votedPolls.includes(pollId)) {
            toast({ title: "Already Voted", description: "You have already cast your vote in this poll." });
            return;
        }

        setIsSubmitting(pollId);

        const voteDocRef = doc(db, "polls", pollId, "votes", user.uid);
        const pollDocRef = doc(db, "polls", pollId);
        
        try {
            await runTransaction(db, async (transaction) => {
                const pollDoc = await transaction.get(pollDocRef);
                if (!pollDoc.exists()) {
                    throw "Poll does not exist!";
                }

                const newOptions = pollDoc.data().options.map((opt: any, index: number) => {
                    if (index === optionIndex) {
                        return { ...opt, votes: (opt.votes || 0) + 1 };
                    }
                    return opt;
                });
                
                transaction.update(pollDocRef, { options: newOptions });
                transaction.set(voteDocRef, { votedFor: optionIndex });
            });

            toast({ title: "Vote Cast!", description: "Thank you for your vote." });
            setVotedPolls(prev => [...prev, pollId]);
        } catch (error: any) {
            console.error("Error casting vote: ", error);
            toast({ title: "Error", description: `Could not cast your vote. ${error.toString()}`, variant: "destructive" });
        } finally {
            setIsSubmitting(null);
        }
    };

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Fan Polls</h1>
                <p className="text-muted-foreground">Have your say in the latest club polls.</p>
            </div>
            <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
                {polls.map((poll) => {
                    const hasVoted = votedPolls.includes(poll.id);
                    const totalVotes = poll.options.reduce((acc: number, opt: any) => acc + (opt.votes || 0), 0);
                    
                    return (
                        <Card key={poll.id}>
                            <CardHeader>
                                <CardTitle>{poll.question}</CardTitle>
                                <CardDescription>vs {poll.opponent} on {new Date(poll.matchDate).toLocaleDateString()}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {poll.options.map((option: any, index: number) => {
                                    const votePercentage = totalVotes > 0 ? ((option.votes || 0) / totalVotes) * 100 : 0;
                                    return (
                                        <div key={index}>
                                            {hasVoted ? (
                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-sm font-medium">
                                                        <span>{option.name}</span>
                                                        <span>{votePercentage.toFixed(1)}% ({option.votes || 0})</span>
                                                    </div>
                                                    <Progress value={votePercentage} />
                                                </div>
                                            ) : (
                                                <Button 
                                                    variant="outline" 
                                                    className="w-full justify-start"
                                                    onClick={() => handleVote(poll.id, index)}
                                                    disabled={isSubmitting === poll.id}
                                                >
                                                    {option.name}
                                                </Button>
                                            )}
                                        </div>
                                    );
                                })}
                            </CardContent>
                            <CardFooter>
                                <p className="text-sm text-muted-foreground">{totalVotes} total votes cast.</p>
                            </CardFooter>
                        </Card>
                    )
                })}
            </div>
             {polls.length === 0 && (
                <div className="text-center py-10 text-muted-foreground">
                    There are no active polls at the moment. Please check back later.
                </div>
            )}
        </div>
    );
}
