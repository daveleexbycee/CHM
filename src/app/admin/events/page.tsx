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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MoreHorizontal, PlusCircle, Trash, Edit } from "lucide-react";
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

export default function AdminEventsPage() {
  const [events, setEvents] = React.useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = React.useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [isFormDialogOpen, setIsFormDialogOpen] = React.useState(false);

  React.useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "events"), (snapshot) => {
      setEvents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const handleDelete = async () => {
    if (selectedEvent) {
      await deleteDoc(doc(db, "events", selectedEvent.id));
      setIsDeleteDialogOpen(false);
      setSelectedEvent(null);
    }
  };
  
  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const newEvent: any = {
      title: formData.get("title"),
      date: formData.get("date"),
      location: formData.get("location"),
      description: formData.get("description"),
      ticketsSold: Number(formData.get("ticketsSold") || 0)
    };

    if (selectedEvent) { // Editing existing event
      const eventDoc = doc(db, "events", selectedEvent.id);
      await updateDoc(eventDoc, newEvent);
    } else { // Creating new event
      await addDoc(collection(db, "events"), newEvent);
    }
    
    setIsFormDialogOpen(false);
    setSelectedEvent(null);
  };
  
  const openFormDialog = (event: any = null) => {
    setSelectedEvent(event);
    setIsFormDialogOpen(true);
  };
  
  const openDeleteDialog = (event: any) => {
    setSelectedEvent(event);
    setIsDeleteDialogOpen(true);
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Event Management</h1>
          <Button onClick={() => openFormDialog()}>
            <PlusCircle className="mr-2 h-4 w-4" /> Create New Event
          </Button>
        </div>
        <Card>
          <CardHeader>
              <CardTitle>All Events</CardTitle>
          </CardHeader>
          <CardContent>
              <Table>
              <TableHeader>
                  <TableRow>
                  <TableHead>Event Title</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-right">Tickets Sold</TableHead>
                  <TableHead>
                      <span className="sr-only">Actions</span>
                  </TableHead>
                  </TableRow>
              </TableHeader>
              <TableBody>
                  {events.map((event) => (
                  <TableRow key={event.id}>
                      <TableCell className="font-medium">{event.title}</TableCell>
                      <TableCell>{event.date}</TableCell>
                      <TableCell>{event.location}</TableCell>
                      <TableCell className="text-right">{event.ticketsSold > 0 ? event.ticketsSold.toLocaleString() : 'N/A'}</TableCell>
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
                              <DropdownMenuItem onSelect={() => openFormDialog(event)}><Edit className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive" onSelect={() => openDeleteDialog(event)}><Trash className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
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
            <DialogTitle>{selectedEvent ? 'Edit Event' : 'Create New Event'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">Title</Label>
                <Input id="title" name="title" defaultValue={selectedEvent?.title} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="text-right">Date</Label>
                <Input id="date" name="date" type="date" defaultValue={selectedEvent?.date} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="location" className="text-right">Location</Label>
                <Input id="location" name="location" defaultValue={selectedEvent?.location} className="col-span-3" required />
              </div>
               <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">Description</Label>
                <Input id="description" name="description" defaultValue={selectedEvent?.description} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="ticketsSold" className="text-right">Tickets Sold</Label>
                <Input id="ticketsSold" name="ticketsSold" type="number" defaultValue={selectedEvent?.ticketsSold || 0} className="col-span-3" />
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
              This action cannot be undone. This will permanently delete the event.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedEvent(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
