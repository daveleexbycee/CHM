
"use client";

import * as React from "react";
import { useAuth } from "@/hooks/use-auth";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ProfilePage() {
    const { user, userData, loading } = useAuth();
    const [name, setName] = React.useState('');
    const [isSaving, setIsSaving] = React.useState(false);
    const { toast } = useToast();

    React.useEffect(() => {
        if (userData) {
            setName(userData.name || '');
        }
    }, [userData]);

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setIsSaving(true);
        const userDocRef = doc(db, "users", user.uid);
        try {
            await updateDoc(userDocRef, { name });
            toast({ title: "Profile Updated", description: "Your name has been successfully updated." });
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };
    
    if (loading) {
        return (
            <div className="max-w-2xl mx-auto space-y-6">
                <Skeleton className="h-8 w-1/4" />
                 <Card>
                    <CardHeader className="flex flex-row items-center gap-4">
                        <Skeleton className="h-16 w-16 rounded-full" />
                        <div className="space-y-2">
                           <Skeleton className="h-6 w-48" />
                            <Skeleton className="h-4 w-64" />
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </CardContent>
                     <CardContent className="border-t pt-6">
                         <Skeleton className="h-10 w-32" />
                     </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold tracking-tight mb-6">Your Profile</h1>
            <Card>
                 <form onSubmit={handleProfileUpdate}>
                    <CardHeader>
                        <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16">
                                <AvatarImage src={userData?.avatarUrl} alt={name} data-ai-hint="person portrait"/>
                                <AvatarFallback>{name?.charAt(0) || user?.email?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <CardTitle>{name}</CardTitle>
                                <CardDescription>{user?.email}</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" value={user?.email || ''} disabled />
                            <p className="text-xs text-muted-foreground">Email address cannot be changed.</p>
                        </div>
                    </CardContent>
                     <CardContent className="border-t pt-6">
                        <Button type="submit" disabled={isSaving}>
                            {isSaving ? "Saving..." : "Save Changes"}
                        </Button>
                     </CardContent>
                </form>
            </Card>
        </div>
    );
}
