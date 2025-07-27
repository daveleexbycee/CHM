"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Goal } from "lucide-react";
import { createUserWithEmailAndPassword, User } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { doc, setDoc } from "firebase/firestore";


const departments = [
  "Biochemistry",
  "Botany",
  "Chemistry",
  "Computer Science",
  "Geology",
  "Industrial Chemistry",
  "Mathematics",
  "Microbiology",
  "Physics",
  "Statistics",
  "Zoology",
];

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isDepartmentModalOpen, setIsDepartmentModalOpen] = useState(false);
  const [isChemistry, setIsChemistry] = useState<boolean | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newUser, setNewUser] = useState<User | null>(null);
  
  const router = useRouter();
  const { toast } = useToast();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      setNewUser(userCredential.user);
      setIsDepartmentModalOpen(true);
    } catch (error: any) {
        toast({
            title: "Sign Up Failed",
            description: error.message,
            variant: "destructive",
        });
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleDepartmentSubmit = async () => {
      if (!newUser) return;
      setIsSubmitting(true);
      
      let finalDepartment = "";
      if (isChemistry === true) {
          finalDepartment = "Chemistry";
      } else if (selectedDepartment) {
          finalDepartment = selectedDepartment;
      }

      if (!finalDepartment) {
          toast({ title: "Please select a department", variant: "destructive" });
          setIsSubmitting(false);
          return;
      }

      try {
          // Create user document in Firestore
          const userDocRef = doc(db, "users", newUser.uid);
          await setDoc(userDocRef, {
              name: fullName,
              email: newUser.email,
              role: "User",
              department: finalDepartment,
              avatarUrl: `https://placehold.co/40x40.png?text=${fullName?.charAt(0) || newUser.email?.charAt(0)}`
          });
          toast({ title: "Welcome!", description: "Your account has been created successfully." });
          setIsDepartmentModalOpen(false);
          router.push("/");

      } catch (error: any) {
           toast({
            title: "An error occurred",
            description: error.message,
            variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
      }

  }


  return (
    <>
    <Card className="mx-auto max-w-sm">
      <CardHeader>
         <div className="flex justify-center mb-4">
            <Goal className="h-12 w-12 text-primary" />
        </div>
        <CardTitle className="text-2xl text-center">Sign Up for CHM</CardTitle>
        <CardDescription className="text-center">
          Enter your information to create an account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSignup}>
            <div className="grid gap-4">
            <div className="grid gap-2">
                <Label htmlFor="full-name">Full name</Label>
                <Input 
                    id="full-name" 
                    placeholder="Max Robinson" 
                    required 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                    id="password" 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Creating Account...' : 'Create an account'}
            </Button>
            <Button variant="outline" className="w-full" type="button">
                Sign up with Google
            </Button>
            </div>
        </form>
        <div className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <Link href="/login" className="underline">
            Login
          </Link>
        </div>
      </CardContent>
    </Card>

    <Dialog open={isDepartmentModalOpen} onOpenChange={setIsDepartmentModalOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Confirm Your Department</DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-4">
                {isChemistry === null && (
                    <>
                        <DialogDescription>
                           Are you in the Chemistry department?
                        </DialogDescription>
                        <div className="flex justify-end gap-4">
                            <Button onClick={() => setIsChemistry(true)}>Yes</Button>
                            <Button variant="outline" onClick={() => setIsChemistry(false)}>No</Button>
                        </div>
                    </>
                )}

                {isChemistry === false && (
                    <>
                        <Label>Please select your department</Label>
                        <Select onValueChange={setSelectedDepartment} value={selectedDepartment}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select department" />
                            </SelectTrigger>
                            <SelectContent>
                                {departments.filter(d => d !== 'Chemistry').map(dept => (
                                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </>
                )}
                 {isChemistry === true && (
                    <p className="text-sm text-muted-foreground">Great! You've selected Chemistry.</p>
                )}
            </div>
             <DialogFooter>
                <Button onClick={handleDepartmentSubmit} disabled={isSubmitting || (isChemistry === false && !selectedDepartment)}>
                    {isSubmitting ? "Saving..." : "Confirm & Continue"}
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
    </>
  );
}
