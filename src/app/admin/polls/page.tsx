
"use client";

import * as React from "react";
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MoreHorizontal, PlusCircle, Trash, Edit, ToggleLeft, ToggleRight, BarChart } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

export default function AdminPollsPage() {
    const [polls, setPolls] = React.useState<any[]>([]);
    const [selectedPoll, setSelectedPoll] = React.useState<any>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
    const [isFormDialogOpen, setIsFormDialogOpen] = React.useState(false);
    const [isResultsDialogOpen, setIsResultsDialogOpen] = React.useState(false);

    // Data for form
    const [pastMatches, setPastMatches] = React.useState<any[]>([]);
    const [players, setPlayers] = React.useState<any[]>([]);
    const [selectedMatchId, setSelectedMatchId] = React.useState("");
    const [selectedPlayerIds, setSelectedPlayerIds] = React.useState<string[]>([]);

    const { toast } = useToast();

    React.useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "polls"), (snapshot) => {
            setPolls(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        // Fetch past matches for the form
        const fetchMatches = async () => {
            const q = query(collection(db, "matches"), where("status", "==", "Past"), orderBy("date", "desc"));
            const querySnapshot = await getDocs(q);
            setPastMatches(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        };

        // Fetch players for the form
        const fetchPlayers = async () => {
            const querySnapshot = await getDocs(collection(db, "players"));
            setPlayers(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        };
        
        fetchMatches();
        fetchPlayers();

        return () => unsubscribe();
    }, []);

    const handleDelete = async () => {
        if (selectedPoll) {
            await deleteDoc(doc(db, "polls", selectedPoll.id));
            toast({ title: "Poll Deleted", description: "The poll has been removed." });
            setIsDeleteDialogOpen(false);
            setSelectedPoll(null);
        }
    };

    const handleToggleStatus = async (poll: any) => {
        const pollDoc = doc(db, "polls", poll.id);
        await updateDoc(pollDoc, { isOpen: !poll.isOpen });
        toast({ title: "Status Updated", description: `Poll is now ${!poll.isOpen ? 'open' : 'closed'}.` });
    };

    const handleCreatePoll = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const question = formData.get("question") as string;
        
        if (!selectedMatchId || selectedPlayerIds.length === 0 || !question) {
            toast({ title: "Missing Fields", description: "Please fill out all required fields.", variant: "destructive" });
            return;
        }

        const match = pastMatches.find(m => m.id === selectedMatchId);
        const pollOptions = selectedPlayerIds.map(playerId => {
            const player = players.find(p => p.id === playerId);
            return { playerId: player.id, name: player.name, votes: 0 };
        });

        const newPoll = {
            question,
            matchId: selectedMatchId,
            matchDate: match.date,
            opponent: match.opponent,
            options: pollOptions,
            isOpen: true,
            createdAt: new Date().toISOString(),
        };

        await addDoc(collection(db, "polls"), newPoll);
        toast({ title: "Poll Created", description: "The new fan poll is now live." });
        setIsFormDialogOpen(false);
        setSelectedMatchId("");
        setSelectedPlayerIds([]);
    };
    
    const openFormDialog = () => {
        setIsFormDialogOpen(true);
    };

    const openDeleteDialog = (poll: any) => {
        setSelectedPoll(poll);
        setIsDeleteDialogOpen(true);
    };
    
    const openResultsDialog = (poll: any) => {
        setSelectedPoll(poll);
        setIsResultsDialogOpen(true);
    };

    return (
        <>
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold tracking-tight">Poll Management</h1>
                    <Button onClick={openFormDialog}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Create New Poll
                    </Button>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>All Polls</CardTitle>
                        <CardDescription>Manage fan polls for past matches.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Question</TableHead>
                                    <TableHead>Match</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Total Votes</TableHead>
                                    <TableHead><span className="sr-only">Actions</span></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {polls.map((poll) => (
                                    <TableRow key={poll.id}>
                                        <TableCell className="font-medium">{poll.question}</TableCell>
                                        <TableCell>vs {poll.opponent} ({new Date(poll.matchDate).toLocaleDateString()})</TableCell>
                                        <TableCell>
                                            <Badge variant={poll.isOpen ? "default" : "secondary"}>
                                                {poll.isOpen ? "Open" : "Closed"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {poll.options.reduce((acc: number, opt: any) => acc + (opt.votes || 0), 0)}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex justify-end">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button aria-haspopup="true" size="icon" variant="ghost">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                            <span className="sr-only">Toggle menu</span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuItem onSelect={() => openResultsDialog(poll)}><BarChart className="mr-2 h-4 w-4" />View Results</DropdownMenuItem>
                                                        <DropdownMenuItem onSelect={() => handleToggleStatus(poll)}>
                                                            {poll.isOpen ? <ToggleLeft className="mr-2 h-4 w-4" /> : <ToggleRight className="mr-2 h-4 w-4" />}
                                                            {poll.isOpen ? "Close Poll" : "Open Poll"}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="text-destructive" onSelect={() => openDeleteDialog(poll)}><Trash className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            {/* Form Dialog for Add */}
            <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Poll</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreatePoll}>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="question">Poll Question</Label>
                                <Input id="question" name="question" defaultValue="Who was the Player of the Match?" required />
                            </div>
                            <div className="space-y-2">
                                <Label>Select Match</Label>
                                <Select onValueChange={setSelectedMatchId} value={selectedMatchId}>
                                    <SelectTrigger><SelectValue placeholder="Choose a past match..." /></SelectTrigger>
                                    <SelectContent>
                                        {pastMatches.map(match => (
                                            <SelectItem key={match.id} value={match.id}>
                                                vs {match.opponent} ({new Date(match.date).toLocaleDateString()})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Select Players (Options)</Label>
                                 <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto p-2 border rounded-md">
                                    {players.map(player => (
                                        <div key={player.id} className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                id={`player-${player.id}`}
                                                checked={selectedPlayerIds.includes(player.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedPlayerIds(prev => [...prev, player.id]);
                                                    } else {
                                                        setSelectedPlayerIds(prev => prev.filter(id => id !== player.id));
                                                    }
                                                }}
                                            />
                                            <Label htmlFor={`player-${player.id}`} className="font-normal">{player.name}</Label>
                                        </div>
                                    ))}
                                 </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                            <Button type="submit">Create Poll</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Results Dialog */}
            <Dialog open={isResultsDialogOpen} onOpenChange={setIsResultsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Poll Results: {selectedPoll?.question}</DialogTitle>
                        <DialogDescription>vs {selectedPoll?.opponent} on {selectedPoll && new Date(selectedPoll.matchDate).toLocaleDateString()}</DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        {selectedPoll?.options.sort((a:any, b:any) => b.votes - a.votes).map((option: any, index: number) => {
                             const totalVotes = selectedPoll.options.reduce((acc: number, opt: any) => acc + (opt.votes || 0), 0);
                             const percentage = totalVotes > 0 ? ((option.votes || 0) / totalVotes) * 100 : 0;
                            return (
                                <div key={index}>
                                    <div className="flex justify-between font-medium text-sm mb-1">
                                        <span>{option.name}</span>
                                        <span>{option.votes || 0} votes</span>
                                    </div>
                                    <Progress value={percentage} />
                                </div>
                            )
                        })}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the poll and all its associated votes.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setSelectedPoll(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
