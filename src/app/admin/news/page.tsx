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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, PlusCircle, Edit, Trash, View, Sparkles } from "lucide-react";
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
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { generateNewsArticle } from "@/ai/flows/generate-news-article-flow";
import { useToast } from "@/hooks/use-toast";

export default function AdminNewsPage() {
  const [articles, setArticles] = React.useState<any[]>([]);
  const [selectedArticle, setSelectedArticle] = React.useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [isFormDialogOpen, setIsFormDialogOpen] = React.useState(false);
  const [isAiDialogOpen, setIsAiDialogOpen] = React.useState(false);
  const [isGenerating, setIsGenerating] = React.useState(false);

  const [formState, setFormState] = React.useState({
    title: "",
    content: "",
    status: "Draft",
    imageUrl: "",
  });

  const { toast } = useToast();

  React.useEffect(() => {
    if (selectedArticle) {
      setFormState({
        title: selectedArticle.title || "",
        content: selectedArticle.content || "",
        status: selectedArticle.status || "Draft",
        imageUrl: selectedArticle.imageUrl || "",
      });
    } else {
      setFormState({ title: "", content: "", status: "Draft", imageUrl: "" });
    }
  }, [selectedArticle]);

  React.useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "news"), (snapshot) => {
      setArticles(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const handleDelete = async () => {
    if (selectedArticle) {
      await deleteDoc(doc(db, "news", selectedArticle.id));
      setIsDeleteDialogOpen(false);
      setSelectedArticle(null);
    }
  };
  
  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    const newArticleData: any = {
      ...formState,
      author: "Admin", // Assuming current user is Admin
      date: new Date().toISOString().split('T')[0],
    };

    if (selectedArticle) { // Editing
      const articleDoc = doc(db, "news", selectedArticle.id);
      await updateDoc(articleDoc, newArticleData);
    } else { // Creating
      await addDoc(collection(db, "news"), newArticleData);
    }
    
    setIsFormDialogOpen(false);
    setSelectedArticle(null);
  };
  
  const handleGenerateArticle = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsGenerating(true);
    const formData = new FormData(event.currentTarget);
    const input = {
      opponent: formData.get("opponent") as string,
      score: formData.get("score") as string,
      highlights: formData.get("highlights") as string,
    };
    try {
      const result = await generateNewsArticle(input);
      setFormState(prevState => ({
          ...prevState,
          title: result.title,
          content: result.content
      }));
      setIsAiDialogOpen(false);
      setIsFormDialogOpen(true);
    } catch(e) {
        toast({ title: "AI Generation Failed", description: "Could not generate the article. Please try again.", variant: "destructive"})
        console.error(e);
    } finally {
        setIsGenerating(false);
    }
  }

  const openFormDialog = (article: any = null) => {
    setSelectedArticle(article);
    setIsFormDialogOpen(true);
  };
  
  const openDeleteDialog = (article: any) => {
    setSelectedArticle(article);
    setIsDeleteDialogOpen(true);
  }


  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-3xl font-bold tracking-tight">News Management</h1>
          <div className="flex gap-2">
            <Button onClick={() => setIsAiDialogOpen(true)} variant="outline">
                <Sparkles className="mr-2 h-4 w-4" /> Generate with AI
            </Button>
            <Button onClick={() => openFormDialog()}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Article
            </Button>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>All Articles</CardTitle>
            <CardDescription>
              Manage all news articles, drafts, and publications.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {articles.map((article) => (
                  <TableRow key={article.id}>
                    <TableCell className="font-medium">{article.title}</TableCell>
                    <TableCell>
                      <Badge variant={article.status === "Published" ? "default" : "secondary"}>
                        {article.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{article.author}</TableCell>
                    <TableCell>{article.date}</TableCell>
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
                            <DropdownMenuItem><View className="mr-2 h-4 w-4" />View</DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => openFormDialog(article)}><Edit className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onSelect={() => openDeleteDialog(article)}><Trash className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
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
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>{selectedArticle ? 'Edit Article' : 'Create New Article'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">Title</Label>
                <Input id="title" name="title" value={formState.title} onChange={(e) => setFormState({...formState, title: e.target.value})} className="col-span-3" required />
              </div>
               <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="imageUrl" className="text-right">Image URL</Label>
                <Input id="imageUrl" name="imageUrl" value={formState.imageUrl} onChange={(e) => setFormState({...formState, imageUrl: e.target.value})} className="col-span-3" placeholder="https://example.com/image.png" />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="content" className="text-right pt-2">Content</Label>
                <Textarea id="content" name="content" value={formState.content} onChange={(e) => setFormState({...formState, content: e.target.value})} className="col-span-3" rows={10} required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">Status</Label>
                <select id="status" name="status" value={formState.status} onChange={(e) => setFormState({...formState, status: e.target.value})} className="col-span-3 border-input bg-background border rounded-md p-2 text-sm">
                    <option>Draft</option>
                    <option>Published</option>
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
      
      {/* AI Generation Dialog */}
      <Dialog open={isAiDialogOpen} onOpenChange={setIsAiDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Generate News Article with AI</DialogTitle>
                <DialogDescription>
                    Provide a few details about the match and the AI will write the article for you.
                </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleGenerateArticle}>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="opponent" className="text-right">Opponent</Label>
                        <Input id="opponent" name="opponent" className="col-span-3" placeholder="e.g. Real Madrid" required />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="score" className="text-right">Final Score</Label>
                        <Input id="score" name="score" className="col-span-3" placeholder="e.g. 3-1" required />
                    </div>
                    <div className="grid grid-cols-4 items-start gap-4">
                        <Label htmlFor="highlights" className="text-right pt-2">Highlights</Label>
                        <Textarea id="highlights" name="highlights" className="col-span-3" placeholder="e.g. Player X scored a hat-trick.&#10;Player Y made a crucial save." rows={5} required />
                    </div>
                </div>
                 <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="submit" disabled={isGenerating}>
                        {isGenerating ? "Generating..." : "Generate"}
                    </Button>
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
              This action cannot be undone. This will permanently delete the article.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedArticle(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
