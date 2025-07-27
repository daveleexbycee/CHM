"use client";

import * as React from "react";
import { collection, doc, onSnapshot, writeBatch } from "firebase/firestore";
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";


const FormBadge = ({ result }: { result: string }) => (
  <Badge
    className={`w-6 h-6 flex items-center justify-center rounded-full border-none ${
      result === "W"
        ? "bg-green-500 text-primary-foreground"
        : result === "D"
        ? "bg-gray-500 text-primary-foreground"
        : "bg-red-500 text-primary-foreground"
    }`}
  >
    {result}
  </Badge>
);

export default function AdminStandingsPage() {
    const [teams, setTeams] = React.useState<any[]>([]);

    React.useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "standings"), (snapshot) => {
            const teamsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            // Sort by position
            teamsData.sort((a, b) => a.position - b.position);
            setTeams(teamsData);
        });
        return () => unsubscribe();
    }, []);

    const handleFieldChange = (teamId: string, field: string, value: string | number) => {
        setTeams(currentTeams => 
            currentTeams.map(team => 
                team.id === teamId ? { ...team, [field]: value } : team
            )
        );
    };
    
    const handleUpdateStandings = async () => {
        const batch = writeBatch(db);
        teams.forEach(team => {
            const teamRef = doc(db, "standings", team.id);
            // Make sure all fields are numbers before writing
            const updatedTeam = {
                ...team,
                position: Number(team.position),
                played: Number(team.played),
                won: Number(team.won),
                drawn: Number(team.drawn),
                lost: Number(team.lost),
                gf: Number(team.gf),
                ga: Number(team.ga),
                gd: Number(team.gd),
                points: Number(team.points),
            }
            batch.update(teamRef, updatedTeam);
        });
        try {
            await batch.commit();
            alert("Standings updated successfully!");
        } catch (error) {
            console.error("Error updating standings: ", error);
            alert("Failed to update standings.");
        }
    };

    return (
        <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">Standings Management</h1>
            <Button onClick={handleUpdateStandings}>Update Standings</Button>
        </div>
        <Card>
            <CardHeader>
            <CardTitle>League Table</CardTitle>
            <CardDescription>
                Manage the current league standings in real-time.
            </CardDescription>
            </CardHeader>
            <CardContent>
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead className="w-[60px] text-center">Pos</TableHead>
                    <TableHead>Club</TableHead>
                    <TableHead className="text-center w-[60px]">MP</TableHead>
                    <TableHead className="text-center w-[60px]">W</TableHead>
                    <TableHead className="text-center w-[60px]">D</TableHead>
                    <TableHead className="text-center w-[60px]">L</TableHead>
                    <TableHead className="text-center w-[60px]">GF</TableHead>
                    <TableHead className="text-center w-[60px]">GA</TableHead>
                    <TableHead className="text-center w-[60px]">GD</TableHead>
                    <TableHead className="text-center w-[60px]">Pts</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {teams.map((team) => (
                    <TableRow key={team.id}>
                    <TableCell className="text-center font-medium">
                        <Input value={team.position} onChange={e => handleFieldChange(team.id, 'position', e.target.value)} className="w-12 text-center" />
                    </TableCell>
                    <TableCell className="font-semibold">{team.name}</TableCell>
                    <TableCell className="text-center">
                        <Input value={team.played} onChange={e => handleFieldChange(team.id, 'played', e.target.value)} className="w-12 text-center" />
                    </TableCell>
                    <TableCell className="text-center">
                        <Input value={team.won} onChange={e => handleFieldChange(team.id, 'won', e.target.value)} className="w-12 text-center" />
                    </TableCell>
                    <TableCell className="text-center">
                        <Input value={team.drawn} onChange={e => handleFieldChange(team.id, 'drawn', e.target.value)} className="w-12 text-center" />
                    </TableCell>
                    <TableCell className="text-center">
                        <Input value={team.lost} onChange={e => handleFieldChange(team.id, 'lost', e.target.value)} className="w-12 text-center" />
                    </TableCell>
                    <TableCell className="text-center">
                        <Input value={team.gf} onChange={e => handleFieldChange(team.id, 'gf', e.target.value)} className="w-12 text-center" />
                    </TableCell>
                    <TableCell className="text-center">
                        <Input value={team.ga} onChange={e => handleFieldChange(team.id, 'ga', e.target.value)} className="w-12 text-center" />
                    </TableCell>
                     <TableCell className="text-center">
                        <Input value={team.gd} onChange={e => handleFieldChange(team.id, 'gd', e.target.value)} className="w-12 text-center" />
                    </TableCell>
                    <TableCell className="text-center font-bold">
                         <Input value={team.points} onChange={e => handleFieldChange(team.id, 'points', e.target.value)} className="w-12 text-center font-bold text-primary" />
                    </TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
            </CardContent>
        </Card>
        </div>
    );
}
