
"use client";

import * as React from "react";
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
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
import { MoreHorizontal, PlusCircle, Trash, Edit, Youtube, Video } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

export default function AdminSchedulePage() {
  const [matches, setMatches] = React.useState<any[]>([]);
  const [selectedMatch, setSelectedMatch] = React.useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [isFormDialogOpen, setIsFormDialogOpen] = React.useState(false);
  const [isHighlightDialogOpen, setIsHighlightDialogOpen] = React.useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "matches"), (snapshot) => {
      setMatches(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const handleDelete = async () => {
    if (selectedMatch) {
      await deleteDoc(doc(db, "matches", selectedMatch.id));
      setIsDeleteDialogOpen(false);
      setSelectedMatch(null);
    }
  };
  
  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const newMatch: any = {
      opponent: formData.get("opponent"),
      team: formData.get("team"),
      date: formData.get("date"),
      time: formData.get("time"),
      competition: formData.get("competition"),
      venue: formData.get("venue"),
      chmLogo: formData.get("chmLogo") || "https://placehold.co/64x64.png",
      opponentLogo: formData.get("opponentLogo") || "https://placehold.co/64x64.png",
      youtubeLink: formData.get("youtubeLink"),
      status: formData.get("status"),
      result: formData.get("result") || null,
      score: formData.get("score") || null,
    };

    if (selectedMatch) { // Editing existing match
      const matchDoc = doc(db, "matches", selectedMatch.id);
      await updateDoc(matchDoc, newMatch);
    } else { // Creating new match
      await addDoc(collection(db, "matches"), newMatch);
    }
    
    setIsFormDialogOpen(false);
    setSelectedMatch(null);
  };
  
  const openFormDialog = (match: any = null) => {
    setSelectedMatch(match);
    setIsFormDialogOpen(true);
  };
  
  const openDeleteDialog = (match: any) => {
    setSelectedMatch(match);
    setIsDeleteDialogOpen(true);
  }

  const openHighlightDialog = (match: any) => {
    setSelectedMatch(match);
    setIsHighlightDialogOpen(true);
  }

  const handleSaveHighlight = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedMatch) return;
    const formData = new FormData(event.currentTarget);
    const highlightData = {
        matchId: selectedMatch.id,
        title: formData.get('title'),
        youtubeLink: formData.get('youtubeLink'),
        date: selectedMatch.date,
    };
    try {
        await addDoc(collection(db, 'highlights'), highlightData);
        toast({title: 'Highlight Added', description: 'The match highlight has been saved.'});
        setIsHighlightDialogOpen(false);
        setSelectedMatch(null);
    } catch (error: any) {
        toast({title: 'Error', description: error.message, variant: 'destructive'});
    }
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Schedule Management</h1>
          <Button onClick={() => openFormDialog()}>
            <PlusCircle className="mr-2 h-4 w-4" /> Create New Match
          </Button>
        </div>
        <Card>
          <CardHeader>
              <CardTitle>All Matches</CardTitle>
              <CardDescription>Manage all upcoming and past matches.</CardDescription>
          </CardHeader>
          <CardContent>
              <Table>
              <TableHeader>
                  <TableRow>
                  <TableHead>Opponent</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Competition</TableHead>
                  <TableHead>Status</TableHead>
                   <TableHead>Score</TableHead>
                  <TableHead>Live Stream</TableHead>
                  <TableHead>
                      <span className="sr-only">Actions</span>
                  </TableHead>
                  </TableRow>
              </TableHeader>
              <TableBody>
                  {matches.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((match) => (
                  <TableRow key={match.id}>
                      <TableCell className="font-medium">{match.opponent}</TableCell>
                      <TableCell>{match.team}</TableCell>
                      <TableCell>{new Date(match.date).toLocaleDateString()}</TableCell>
                      <TableCell>{match.time}</TableCell>
                      <TableCell>{match.competition}</TableCell>
                      <TableCell><Badge variant={match.status === 'Live' ? 'destructive' : match.status === 'Upcoming' ? 'default' : 'secondary'}>{match.status}</Badge></TableCell>
                       <TableCell>{match.score || 'N/A'}</TableCell>
                       <TableCell>
                        {match.youtubeLink ? <Youtube className="h-5 w-5 text-red-600" /> : 'N/A'}
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
                              <DropdownMenuItem onSelect={() => openFormDialog(match)}><Edit className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                              {match.status === 'Past' && (
                                <DropdownMenuItem onSelect={() => openHighlightDialog(match)}><Video className="mr-2 h-4 w-4" />Add Highlight</DropdownMenuItem>
                              )}
                              <DropdownMenuItem className="text-destructive" onSelect={() => openDeleteDialog(match)}><Trash className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
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

      {/* Form Dialog for Add/Edit */}
      <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedMatch ? 'Edit Match' : 'Create New Match'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave}>
            <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="opponent" className="text-right">Opponent</Label>
                <Input id="opponent" name="opponent" defaultValue={selectedMatch?.opponent} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="team" className="text-right">Team</Label>
                <select 
                    id="team" 
                    name="team" 
                    defaultValue={selectedMatch?.team || "Men's First Team"} 
                    className="col-span-3 border-input bg-background border rounded-md p-2 text-sm h-10"
                    required
                >
                    <option>Men's First Team</option>
                    <option>Women's First Team</option>
                    <option>Year 1 - Men</option>
                    <option>Year 1 - Women</option>
                    <option>Year 2 - Men</option>
                    <option>Year 2 - Women</option>
                    <option>Year 3 - Men</option>
                    <option>Year 3 - Women</option>
                    <option>Year 4 - Men</option>
                    <option>Year 4 - Women</option>
                </select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="text-right">Date</Label>
                <Input id="date" name="date" type="date" defaultValue={selectedMatch?.date} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="time" className="text-right">Time</Label>
                <Input id="time" name="time" type="time" defaultValue={selectedMatch?.time} className="col-span-3" required />
              </div>
               <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="competition" className="text-right">Competition</Label>
                <Input id="competition" name="competition" defaultValue={selectedMatch?.competition} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="venue" className="text-right">Venue</Label>
                 <select id="venue" name="venue" defaultValue={selectedMatch?.venue || 'Home'} className="col-span-3 border-input bg-background border rounded-md p-2 text-sm h-10">
                    <option>Home</option>
                    <option>Away</option>
                </select>
              </div>
               <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="chmLogo" className="text-right">CHM Logo</Label>
                <Input id="chmLogo" name="chmLogo" defaultValue={selectedMatch?.chmLogo} className="col-span-3" placeholder="https://example.com/logo.png" />
              </div>
               <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="opponentLogo" className="text-right">Opponent Logo</Label>
                <Input id="opponentLogo" name="opponentLogo" defaultValue={selectedMatch?.opponentLogo} className="col-span-3" placeholder="https://example.com/logo.png" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="youtubeLink" className="text-right">YouTube Link</Label>
                <Input id="youtubeLink" name="youtubeLink" defaultValue={selectedMatch?.youtubeLink} className="col-span-3" placeholder="https://www.youtube.com/watch?v=..." />
              </div>
               <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="score" className="text-right">Score</Label>
                <Input id="score" name="score" defaultValue={selectedMatch?.score} className="col-span-3" placeholder="e.g. 3-0"/>
              </div>
               <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="result" className="text-right">Result</Label>
                 <select id="result" name="result" defaultValue={selectedMatch?.result} className="col-span-3 border-input bg-background border rounded-md p-2 text-sm h-10">
                    <option value="">N/A</option>
                    <option value="W">Win (W)</option>
                    <option value="D">Draw (D)</option>
                    <option value="L">Loss (L)</option>
                </select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">Status</Label>
                 <select id="status" name="status" defaultValue={selectedMatch?.status || 'Upcoming'} className="col-span-3 border-input bg-background border rounded-md p-2 text-sm h-10">
                    <option>Upcoming</option>
                    <option>Past</option>
                    <option>Live</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
       {/* Highlight Dialog */}
       <Dialog open={isHighlightDialogOpen} onOpenChange={setIsHighlightDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Highlight for vs {selectedMatch?.opponent}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSaveHighlight}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="title" className="text-right">Title</Label>
                            <Input id="title" name="title" className="col-span-3" placeholder="e.g. Amazing Goal by Player X" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="youtubeLink" className="text-right">YouTube Link</Label>
                            <Input id="youtubeLink" name="youtubeLink" className="col-span-3" placeholder="https://www.youtube.com/watch?v=..." required />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button type="submit">Save Highlight</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
       </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the match.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedMatch(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
