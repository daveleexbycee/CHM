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
import { MoreHorizontal, PlusCircle, Edit, Trash } from "lucide-react";
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

export default function AdminStorePage() {
    const [products, setProducts] = React.useState<any[]>([]);
    const [selectedProduct, setSelectedProduct] = React.useState<any>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
    const [isFormDialogOpen, setIsFormDialogOpen] = React.useState(false);

    React.useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "products"), (snapshot) => {
          setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsubscribe();
    }, []);

    const handleDelete = async () => {
        if (selectedProduct) {
            await deleteDoc(doc(db, "products", selectedProduct.id));
            setIsDeleteDialogOpen(false);
            setSelectedProduct(null);
        }
    };
    
    const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const newProductData: any = {
            name: formData.get("name"),
            price: parseFloat(formData.get("price") as string),
            stock: parseInt(formData.get("stock") as string, 10),
            category: formData.get("category"),
            description: formData.get("description"),
            imageUrl: formData.get("imageUrl") || "https://placehold.co/600x600.png",
            imageHint: "team merchandise"
        };

        if (selectedProduct) { // Editing
            const productDoc = doc(db, "products", selectedProduct.id);
            await updateDoc(productDoc, newProductData);
        } else { // Creating
            await addDoc(collection(db, "products"), newProductData);
        }
        
        setIsFormDialogOpen(false);
        setSelectedProduct(null);
    };
    
    const openFormDialog = (product: any = null) => {
        setSelectedProduct(product);
        setIsFormDialogOpen(true);
    };
    
    const openDeleteDialog = (product: any) => {
        setSelectedProduct(product);
        setIsDeleteDialogOpen(true);
    }

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Store Management</h1>
          <Button onClick={() => openFormDialog()}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Product
          </Button>
        </div>
        <Card>
          <CardHeader>
              <CardTitle>All Products</CardTitle>
              <CardDescription>Manage your club's official merchandise.</CardDescription>
          </CardHeader>
          <CardContent>
              <Table>
              <TableHeader>
                  <TableRow>
                  <TableHead className="w-[80px]">Image</TableHead>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead>
                      <span className="sr-only">Actions</span>
                  </TableHead>
                  </TableRow>
              </TableHeader>
              <TableBody>
                  {products.map((product) => (
                  <TableRow key={product.id}>
                      <TableCell>
                      <Image
                          alt={product.name}
                          className="aspect-square rounded-md object-cover"
                          height="40"
                          src={product.imageUrl}
                          width="40"
                          data-ai-hint={product.imageHint || "team merchandise"}
                      />
                      </TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>
                      <Badge variant="outline">{product.category}</Badge>
                      </TableCell>
                      <TableCell>{product.stock}</TableCell>
                      <TableCell className="text-right">₦{product.price.toFixed(2)}</TableCell>
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
                                  <DropdownMenuItem onSelect={() => openFormDialog(product)}><Edit className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                                  <DropdownMenuItem className="text-destructive" onSelect={() => openDeleteDialog(product)}><Trash className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
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
                <DialogTitle>{selectedProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave}>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">Name</Label>
                        <Input id="name" name="name" defaultValue={selectedProduct?.name} className="col-span-3" required />
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="description" className="text-right">Description</Label>
                        <Input id="description" name="description" defaultValue={selectedProduct?.description} className="col-span-3" required />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="category" className="text-right">Category</Label>
                        <Input id="category" name="category" defaultValue={selectedProduct?.category} className="col-span-3" required />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="price" className="text-right">Price</Label>
                        <Input id="price" name="price" type="number" step="0.01" defaultValue={selectedProduct?.price} className="col-span-3" required />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="stock" className="text-right">Stock</Label>
                        <Input id="stock" name="stock" type="number" defaultValue={selectedProduct?.stock} className="col-span-3" required />
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="imageUrl" className="text-right">Image URL</Label>
                        <Input id="imageUrl" name="imageUrl" defaultValue={selectedProduct?.imageUrl} className="col-span-3" placeholder="https://example.com/image.png" />
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
                This action cannot be undone. This will permanently delete the product.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setSelectedProduct(null)}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </>
  );
}
