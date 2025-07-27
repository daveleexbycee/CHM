"use client";

import * as React from "react";
import { collection, onSnapshot, doc, getDocs, deleteDoc, updateDoc, setDoc, writeBatch } from "firebase/firestore";
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
import { MoreHorizontal, PlusCircle, UserCog, Trash, Edit } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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


export default function AdminUsersPage() {
  const [users, setUsers] = React.useState<any[]>([]);
  const [selectedUser, setSelectedUser] = React.useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [isFormDialogOpen, setIsFormDialogOpen] = React.useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    // Note: Firestore SDK does not provide a direct way to list all users
    // for security reasons. This implementation fetches users from a 'users'
    // collection in Firestore. You are responsible for populating this collection
    // when a user signs up.
    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const handleDelete = async () => {
    if (selectedUser) {
      try {
        // This only deletes the user document from Firestore, not from Firebase Auth.
        // Deleting from Auth requires a backend function for security.
        await deleteDoc(doc(db, "users", selectedUser.id));
        toast({ title: "User Deleted", description: "User document has been removed from Firestore." });
      } catch(error: any) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } finally {
        setIsDeleteDialogOpen(false);
        setSelectedUser(null);
      }
    }
  };
  
  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const updatedUserData = {
        name: formData.get("name"),
        email: formData.get("email"),
        role: formData.get("role"),
    };

    if (selectedUser) { // Editing
      try {
        const userDoc = doc(db, "users", selectedUser.id);
        await updateDoc(userDoc, updatedUserData);
        toast({ title: "User Updated", description: "User details have been saved." });
      } catch (error: any) {
         toast({ title: "Error", description: error.message, variant: "destructive" });
      }
    }
    // Note: Creating a user here only creates a Firestore document.
    // It does not create an authentication entry in Firebase Auth.
    // This form is primarily for editing existing users.
    
    setIsFormDialogOpen(false);
    setSelectedUser(null);
  };
  
  const openFormDialog = (user: any = null) => {
    setSelectedUser(user);
    setIsFormDialogOpen(true);
  };
  
  const openDeleteDialog = (user: any) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          {/* <Button onClick={() => openFormDialog()}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add New User
          </Button> */}
        </div>
        <Card>
          <CardHeader>
              <CardTitle>All Users</CardTitle>
              <CardDescription>Manage user accounts and roles. User authentication must be managed via the Firebase Console.</CardDescription>
          </CardHeader>
          <CardContent>
              <Table>
              <TableHeader>
                  <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>User ID</TableHead>
                  <TableHead>
                      <span className="sr-only">Actions</span>
                  </TableHead>
                  </TableRow>
              </TableHeader>
              <TableBody>
                  {users.map((user) => (
                  <TableRow key={user.id}>
                      <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                          <AvatarImage src={user.avatarUrl || `https://placehold.co/40x40.png?text=${user.name?.charAt(0)}`} alt="Avatar" data-ai-hint="person face" />
                          <AvatarFallback>{user.name?.charAt(0) || user.email?.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="grid gap-0.5">
                          <p className="font-medium">{user.name || 'N/A'}</p>
                          </div>
                      </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                      <Badge variant={user.role === "Admin" ? "destructive" : "outline"}>{user.role}</Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{user.id}</TableCell>
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
                                  <DropdownMenuItem onSelect={() => openFormDialog(user)}><Edit className="mr-2 h-4 w-4" />Edit User</DropdownMenuItem>
                                  <DropdownMenuItem className="text-destructive" onSelect={() => openDeleteDialog(user)}><Trash className="mr-2 h-4 w-4" />Delete User Doc</DropdownMenuItem>
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
            <DialogContent>
            <DialogHeader>
                <DialogTitle>{selectedUser ? 'Edit User' : 'Add New User'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave}>
                <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">Full Name</Label>
                    <Input id="name" name="name" defaultValue={selectedUser?.name} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">Email</Label>
                    <Input id="email" name="email" type="email" defaultValue={selectedUser?.email} className="col-span-3" required />
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="role" className="text-right">Role</Label>
                    <select id="role" name="role" defaultValue={selectedUser?.role || 'User'} className="col-span-3 border-input bg-background border rounded-md p-2 text-sm">
                        <option>User</option>
                        <option>Admin</option>
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
        
        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the user's document from the Firestore 'users' collection. It will not delete the user from Firebase Authentication.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setSelectedUser(null)}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Delete User Document</AlertDialogAction>
            </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </>
  );
}
