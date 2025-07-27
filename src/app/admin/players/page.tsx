
"use client";

import * as React from "react";
import Image from "next/image";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, PlusCircle, Edit, Trash, BarChart2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
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
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

const StatInput = ({ label, name, defaultValue }: { label: string, name: string, defaultValue: any }) => (
    <div className="grid grid-cols-2 items-center gap-2">
        <Label htmlFor={name} className="text-sm text-right">{label}</Label>
        <Input id={name} name={name} type="number" defaultValue={defaultValue || 0} className="h-8" />
    </div>
);


export default function AdminPlayersPage() {
    const [players, setPlayers] = React.useState<any[]>([]);
    const [selectedPlayer, setSelectedPlayer] = React.useState<any>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
    const [isFormDialogOpen, setIsFormDialogOpen] = React.useState(false);
    const [isStatsDialogOpen, setIsStatsDialogOpen] = React.useState(false);

    React.useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "players"), (snapshot) => {
          setPlayers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsubscribe();
    }, []);

    const handleDelete = async () => {
        if (selectedPlayer) {
            await deleteDoc(doc(db, "players", selectedPlayer.id));
            setIsDeleteDialogOpen(false);
            setSelectedPlayer(null);
        }
    };
    
    const handleSaveProfile = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const traitsValue = formData.get("traits") as string;
        const newPlayerData: any = {
            name: formData.get("name"),
            position: formData.get("position"),
            squad: formData.get("squad"),
            number: Number(formData.get("number")),
            nationality: formData.get("nationality"),
            birthDate: formData.get("birthDate"),
            height: formData.get("height"),
            imageUrl: formData.get("imageUrl") || "https://placehold.co/400x600.png",
            imageHint: "athlete portrait",
            bio: formData.get("bio"),
            traits: traitsValue ? traitsValue.split(',').map(t => t.trim()) : [],
            status: formData.get("status"),
            year: formData.get("year"),
        };

        if (selectedPlayer) { // Editing
            const playerDoc = doc(db, "players", selectedPlayer.id);
            await updateDoc(playerDoc, newPlayerData);
        } else { // Creating
            await addDoc(collection(db, "players"), newPlayerData);
        }
        
        setIsFormDialogOpen(false);
        setSelectedPlayer(null);
    };

     const handleSaveStats = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        
        const statsData = {
            apps: Number(formData.get('apps')),
            goals: Number(formData.get('goals')),
            assists: Number(formData.get('assists')),
            yellowCards: Number(formData.get('yellowCards')),
            redCards: Number(formData.get('redCards')),
            potential: Number(formData.get('potential')),
            skillMoves: Number(formData.get('skillMoves')),
            weakFoot: Number(formData.get('weakFoot')),
            stats: {
                pace: {
                    acc: Number(formData.get('pace-acc')),
                    speed: Number(formData.get('pace-speed'))
                },
                shooting: {
                    fin: Number(formData.get('shooting-fin')),
                    long: Number(formData.get('shooting-long')),
                    pow: Number(formData.get('shooting-pow')),
                    pen: Number(formData.get('shooting-pen')),
                },
                passing: {
                    short: Number(formData.get('passing-short')),
                    long: Number(formData.get('passing-long')),
                    cross: Number(formData.get('passing-cross')),
                    curve: Number(formData.get('passing-curve')),
                },
                dribbling: {
                    ctrl: Number(formData.get('dribbling-ctrl')),
                    agi: Number(formData.get('dribbling-agi')),
                    bal: Number(formData.get('dribbling-bal')),
                },
                defense: {
                    mark: Number(formData.get('defense-mark')),
                    stand: Number(formData.get('defense-stand')),
                    slide: Number(formData.get('defense-slide')),
                    int: Number(formData.get('defense-int')),
                },
                physicality: {
                    str: Number(formData.get('physicality-str')),
                    stam: Number(formData.get('physicality-stam')),
                    agg: Number(formData.get('physicality-agg')),
                    jump: Number(formData.get('physicality-jump')),
                }
            }
        };

        if (selectedPlayer) {
            const playerDoc = doc(db, "players", selectedPlayer.id);
            await updateDoc(playerDoc, statsData);
        }
        
        setIsStatsDialogOpen(false);
        setSelectedPlayer(null);
    };
    
    const openFormDialog = (player: any = null) => {
        setSelectedPlayer(player);
        setIsFormDialogOpen(true);
    };
    
    const openDeleteDialog = (player: any) => {
        setSelectedPlayer(player);
        setIsDeleteDialogOpen(true);
    }
    
    const openStatsDialog = (player: any) => {
        setSelectedPlayer(player);
        setIsStatsDialogOpen(true);
    };


  return (
    <>
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Player Management</h1>
                <Button onClick={() => openFormDialog()}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Player
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>All Players</CardTitle>
                    <CardDescription>Manage player profiles, stats, and squads.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead className="w-[80px]">Photo</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Number</TableHead>
                        <TableHead>Position</TableHead>
                        <TableHead>Squad</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>
                            <span className="sr-only">Actions</span>
                        </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {players.map((player) => (
                        <TableRow key={player.id}>
                            <TableCell>
                            <Image
                                alt={player.name}
                                className="aspect-square rounded-full object-cover"
                                height="40"
                                src={player.imageUrl}
                                width="40"
                                data-ai-hint={player.imageHint}
                            />
                            </TableCell>
                            <TableCell className="font-medium">{player.name}</TableCell>
                            <TableCell>{player.number}</TableCell>
                            <TableCell>{player.position}</TableCell>
                            <TableCell>
                                <Badge variant="outline">{player.squad}</Badge>
                            </TableCell>
                            <TableCell>
                                <Badge variant={player.status !== 'Available' ? 'destructive' : 'secondary'}>{player.status || 'Available'}</Badge>
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
                                        <DropdownMenuItem onSelect={() => openFormDialog(player)}><Edit className="mr-2 h-4 w-4" />Edit Profile</DropdownMenuItem>
                                        <DropdownMenuItem onSelect={() => openStatsDialog(player)}><BarChart2 className="mr-2 h-4 w-4" />Update Stats</DropdownMenuItem>
                                        <DropdownMenuItem className="text-destructive" onSelect={() => openDeleteDialog(player)}><Trash className="mr-2 h-4 w-4" />Delete Player</DropdownMenuItem>
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

        {/* Profile Form Dialog for Add/Edit */}
        <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>{selectedPlayer ? 'Edit Player' : 'Add New Player'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSaveProfile}>
                    <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">Name</Label>
                            <Input id="name" name="name" defaultValue={selectedPlayer?.name} className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="number" className="text-right">Number</Label>
                            <Input id="number" name="number" type="number" defaultValue={selectedPlayer?.number} className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="position" className="text-right">Position</Label>
                             <select id="position" name="position" defaultValue={selectedPlayer?.position} className="col-span-3 border-input bg-background border rounded-md p-2 text-sm h-10" required>
                                <option value="" disabled>Select a position</option>
                                <optgroup label="Goalkeeper">
                                    <option value="GK">Goalkeeper (GK)</option>
                                </optgroup>
                                <optgroup label="Defenders">
                                    <option value="CB">Center Back (CB)</option>
                                    <option value="RB">Right Back (RB)</option>
                                    <option value="LB">Left Back (LB)</option>
                                    <option value="RWB">Right Wing Back (RWB)</option>
                                    <option value="LWB">Left Wing Back (LWB)</option>
                                    <option value="SW">Sweeper (SW)</option>
                                </optgroup>
                                <optgroup label="Midfielders">
                                    <option value="CM">Center Midfielder (CM)</option>
                                    <option value="CDM">Defensive Midfielder (CDM)</option>
                                    <option value="CAM">Attacking Midfielder (CAM)</option>
                                    <option value="RM">Right Midfielder (RM)</option>
                                    <option value="LM">Left Midfielder (LM)</option>
                                    <option value="Mezzala">Mezzala</option>
                                    <option value="Regista">Regista</option>
                                    <option value="Box-to-Box Midfielder">Box-to-Box Midfielder</option>
                                </optgroup>
                                <optgroup label="Forwards">
                                    <option value="ST">Striker (ST)</option>
                                    <option value="CF">Center Forward (CF)</option>
                                    <option value="SS">Second Striker (SS)</option>
                                    <option value="RW">Right Winger (RW)</option>
                                    <option value="LW">Left Winger (LW)</option>
                                    <option value="False 9">False 9</option>
                                    <option value="Target Man">Target Man</option>
                                    <option value="Poacher">Poacher</option>
                                    <option value="Inverted Winger">Inverted Winger</option>
                                </optgroup>
                            </select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="squad" className="text-right">Squad</Label>
                            <select id="squad" name="squad" defaultValue={selectedPlayer?.squad || "Men's First Team"} className="col-span-3 border-input bg-background border rounded-md p-2 text-sm h-10">
                                <option>Men's First Team</option>
                                <option>Women's First Team</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="status" className="text-right">Status</Label>
                            <select id="status" name="status" defaultValue={selectedPlayer?.status || "Available"} className="col-span-3 border-input bg-background border rounded-md p-2 text-sm h-10">
                                <option>Available</option>
                                <option>Injured</option>
                                <option>Recovering</option>
                                <option>Not Available</option>
                            </select>
                        </div>
                         <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="year" className="text-right">Year</Label>
                            <select id="year" name="year" defaultValue={selectedPlayer?.year} className="col-span-3 border-input bg-background border rounded-md p-2 text-sm h-10">
                                <option value="" disabled>Select a year</option>
                                <option value="yr1">Year 1</option>
                                <option value="yr2">Year 2</option>
                                <option value="yr3">Year 3</option>
                                <option value="yr4">Year 4</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="nationality" className="text-right">Nationality</Label>
                            <Input id="nationality" name="nationality" defaultValue={selectedPlayer?.nationality} className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="birthDate" className="text-right">Birth Date</Label>
                            <Input id="birthDate" name="birthDate" type="date" defaultValue={selectedPlayer?.birthDate} className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="height" className="text-right">Height</Label>
                            <Input id="height" name="height" defaultValue={selectedPlayer?.height} placeholder="e.g., 185cm" className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="imageUrl" className="text-right">Image URL</Label>
                            <Input id="imageUrl" name="imageUrl" defaultValue={selectedPlayer?.imageUrl} className="col-span-3" placeholder="https://example.com/image.png" />
                        </div>
                         <div className="grid grid-cols-4 items-start gap-4">
                            <Label htmlFor="bio" className="text-right pt-2">Biography</Label>
                            <Textarea id="bio" name="bio" defaultValue={selectedPlayer?.bio} className="col-span-3" rows={5} />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="traits" className="text-right">Traits</Label>
                            <Input id="traits" name="traits" defaultValue={selectedPlayer?.traits?.join(', ')} className="col-span-3" placeholder="e.g. Speedster, Playmaker" />
                        </div>
                    </div>
                    <DialogFooter className="pt-4 border-t">
                        <DialogClose asChild>
                            <Button type="button" variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button type="submit">Save Profile</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
        
        {/* Stats Form Dialog */}
        <Dialog open={isStatsDialogOpen} onOpenChange={setIsStatsDialogOpen}>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Update Stats for {selectedPlayer?.name}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSaveStats}>
                    <div className="grid gap-6 py-4 max-h-[70vh] overflow-y-auto pr-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader><CardTitle>Performance</CardTitle></CardHeader>
                                <CardContent className="grid grid-cols-2 gap-x-4 gap-y-2">
                                    <StatInput label="Apps" name="apps" defaultValue={selectedPlayer?.apps} />
                                    <StatInput label="Goals" name="goals" defaultValue={selectedPlayer?.goals} />
                                    <StatInput label="Assists" name="assists" defaultValue={selectedPlayer?.assists} />
                                    <StatInput label="Yellow Cards" name="yellowCards" defaultValue={selectedPlayer?.yellowCards} />
                                    <StatInput label="Red Cards" name="redCards" defaultValue={selectedPlayer?.redCards} />
                                </CardContent>
                            </Card>
                            
                            <Card>
                                 <CardHeader><CardTitle>Overall Attributes</CardTitle></CardHeader>
                                 <CardContent className="grid grid-cols-2 gap-x-4 gap-y-2">
                                    <StatInput label="Potential" name="potential" defaultValue={selectedPlayer?.potential} />
                                    <StatInput label="Skill Moves (1-5)" name="skillMoves" defaultValue={selectedPlayer?.skillMoves} />
                                    <StatInput label="Weak Foot (1-5)" name="weakFoot" defaultValue={selectedPlayer?.weakFoot} />
                                 </CardContent>
                            </Card>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6">
                             <Card>
                                <CardHeader><CardTitle className="text-lg">Pace</CardTitle></CardHeader>
                                <CardContent className="space-y-2">
                                    <StatInput label="Acceleration" name="pace-acc" defaultValue={selectedPlayer?.stats?.pace?.acc} />
                                    <StatInput label="Sprint Speed" name="pace-speed" defaultValue={selectedPlayer?.stats?.pace?.speed} />
                                </CardContent>
                            </Card>
                             <Card>
                                <CardHeader><CardTitle className="text-lg">Shooting</CardTitle></CardHeader>
                                <CardContent className="space-y-2">
                                     <StatInput label="Finishing" name="shooting-fin" defaultValue={selectedPlayer?.stats?.shooting?.fin} />
                                    <StatInput label="Long Shots" name="shooting-long" defaultValue={selectedPlayer?.stats?.shooting?.long} />
                                    <StatInput label="Shot Power" name="shooting-pow" defaultValue={selectedPlayer?.stats?.shooting?.pow} />
                                    <StatInput label="Penalties" name="shooting-pen" defaultValue={selectedPlayer?.stats?.shooting?.pen} />
                                </CardContent>
                            </Card>
                             <Card>
                                <CardHeader><CardTitle className="text-lg">Passing</CardTitle></CardHeader>
                                <CardContent className="space-y-2">
                                    <StatInput label="Short Passing" name="passing-short" defaultValue={selectedPlayer?.stats?.passing?.short} />
                                    <StatInput label="Long Passing" name="passing-long" defaultValue={selectedPlayer?.stats?.passing?.long} />
                                    <StatInput label="Crossing" name="passing-cross" defaultValue={selectedPlayer?.stats?.passing?.cross} />
                                    <StatInput label="Curve" name="passing-curve" defaultValue={selectedPlayer?.stats?.passing?.curve} />
                                </CardContent>
                            </Card>
                             <Card>
                                <CardHeader><CardTitle className="text-lg">Dribbling</CardTitle></CardHeader>
                                <CardContent className="space-y-2">
                                    <StatInput label="Ball Control" name="dribbling-ctrl" defaultValue={selectedPlayer?.stats?.dribbling?.ctrl} />
                                    <StatInput label="Agility" name="dribbling-agi" defaultValue={selectedPlayer?.stats?.dribbling?.agi} />
                                    <StatInput label="Balance" name="dribbling-bal" defaultValue={selectedPlayer?.stats?.dribbling?.bal} />
                                </CardContent>
                            </Card>
                             <Card>
                                <CardHeader><CardTitle className="text-lg">Defense</CardTitle></CardHeader>
                                <CardContent className="space-y-2">
                                     <StatInput label="Marking" name="defense-mark" defaultValue={selectedPlayer?.stats?.defense?.mark} />
                                     <StatInput label="Stand Tackle" name="defense-stand" defaultValue={selectedPlayer?.stats?.defense?.stand} />
                                     <StatInput label="Slide Tackle" name="defense-slide" defaultValue={selectedPlayer?.stats?.defense?.slide} />
                                     <StatInput label="Interceptions" name="defense-int" defaultValue={selectedPlayer?.stats?.defense?.int} />
                                </CardContent>
                            </Card>
                             <Card>
                                <CardHeader><CardTitle className="text-lg">Physicality</CardTitle></CardHeader>
                                <CardContent className="space-y-2">
                                    <StatInput label="Strength" name="physicality-str" defaultValue={selectedPlayer?.stats?.physicality?.str} />
                                    <StatInput label="Stamina" name="physicality-stam" defaultValue={selectedPlayer?.stats?.physicality?.stam} />
                                    <StatInput label="Aggression" name="physicality-agg" defaultValue={selectedPlayer?.stats?.physicality?.agg} />
                                    <StatInput label="Jumping" name="physicality-jump" defaultValue={selectedPlayer?.stats?.physicality?.jump} />
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                    <DialogFooter className="pt-4 border-t">
                        <DialogClose asChild>
                            <Button type="button" variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button type="submit">Save Stats</Button>
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
                This action cannot be undone. This will permanently delete the player.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setSelectedPlayer(null)}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </>
  );
}

    

    

    
