
"use client";

import * as React from "react";
import { collection, onSnapshot } from "firebase/firestore";
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

export default function StandingsPage() {
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

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold tracking-tight">League Standings</h1>
      <div className="border rounded-lg overflow-x-auto">
        <Table className="min-w-[800px]">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px] text-center">Pos</TableHead>
              <TableHead className="min-w-[150px]">Club</TableHead>
              <TableHead className="text-center">MP</TableHead>
              <TableHead className="text-center">W</TableHead>
              <TableHead className="text-center">D</TableHead>
              <TableHead className="text-center">L</TableHead>
              <TableHead className="text-center">GF</TableHead>
              <TableHead className="text-center">GA</TableHead>
              <TableHead className="text-center">GD</TableHead>
              <TableHead className="text-center">Pts</TableHead>
              <TableHead className="min-w-[140px]">Form</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teams.map((team) => (
              <TableRow key={team.id} className={team.name === "CHM FC" ? "bg-primary/10" : ""}>
                <TableCell className="text-center font-medium">{team.position}</TableCell>
                <TableCell className="font-semibold">{team.name}</TableCell>
                <TableCell className="text-center">{team.played}</TableCell>
                <TableCell className="text-center">{team.won}</TableCell>
                <TableCell className="text-center">{team.drawn}</TableCell>
                <TableCell className="text-center">{team.lost}</TableCell>
                <TableCell className="text-center">{team.gf}</TableCell>
                <TableCell className="text-center">{team.ga}</TableCell>
                <TableCell className="text-center">{team.gd}</TableCell>
                <TableCell className="text-center font-bold text-primary">{team.points}</TableCell>
                 <TableCell>
                    <div className="flex gap-1">
                      {(team.form || []).map((result: string, index: number) => (
                          <FormBadge key={index} result={result} />
                      ))}
                    </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
