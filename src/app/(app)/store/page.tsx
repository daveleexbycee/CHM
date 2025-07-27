
"use client";

import * as React from "react";
import Image from "next/image";
import { collection, onSnapshot, addDoc, getDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);


export default function StorePage() {
  const [kits, setKits] = React.useState<any[]>([]);
  const [selectedKit, setSelectedKit] = React.useState<any>(null);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = React.useState(false);
  const [shippingAddress, setShippingAddress] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [paymentSettings, setPaymentSettings] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  
  const { user, userData } = useAuth();
  const { toast } = useToast();

   React.useEffect(() => {
    const unsubscribeProducts = onSnapshot(collection(db, "products"), (snapshot) => {
      setKits(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    
    const fetchSettings = async () => {
        const docRef = doc(db, "settings", "payment");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            setPaymentSettings(docSnap.data());
        }
    };
    fetchSettings();

    return () => unsubscribeProducts();
  }, []);

  const handleOrderClick = (kit: any) => {
    if (!user) {
        toast({ title: "Authentication Required", description: "Please log in to place an order.", variant: "destructive" });
        return;
    }
    setSelectedKit(kit);
    setIsOrderDialogOpen(true);
  };
  

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedKit || !shippingAddress) {
      toast({ title: "Missing Information", description: "Please provide a shipping address.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);

    try {
      // Create order document in Firestore
      await addDoc(collection(db, "orders"), {
        userId: user.uid,
        userName: userData?.name || user.email,
        productId: selectedKit.id,
        productName: selectedKit.name,
        price: selectedKit.price,
        shippingAddress,
        status: "Pending",
        orderDate: new Date().toISOString(),
      });
      
      toast({ title: "Order Placed!", description: "Your order has been submitted. Please send your receipt via WhatsApp." });
      setIsOrderDialogOpen(false);
      setSelectedKit(null);
      setShippingAddress("");

    } catch (error: any) {
      toast({ title: "Order Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <>
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Club Store</h1>
      </div>
       {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <Skeleton className="aspect-square w-full" />
              <CardContent className="p-4 space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-8 w-1/4 mt-4" />
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {kits.map((kit) => (
          <Card key={kit.id} className="flex flex-col overflow-hidden hover:shadow-xl transition-shadow">
            <CardHeader className="p-0">
               <Image
                  src={kit.imageUrl}
                  alt={kit.name}
                  width={600}
                  height={600}
                  className="aspect-square object-cover"
                  data-ai-hint={kit.imageHint}
                />
            </CardHeader>
            <CardContent className="p-4 flex-grow">
              <CardTitle>{kit.name}</CardTitle>
              <CardDescription className="mt-2">{kit.description}</CardDescription>
              <p className="text-2xl font-bold mt-4">₦{kit.price?.toLocaleString()}</p>
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <Button className="w-full" onClick={() => handleOrderClick(kit)}>
                <ShoppingCart className="mr-2 h-4 w-4" /> Place Order
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      )}
    </div>

    {/* Order Dialog */}
    <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Place Order for {selectedKit?.name}</DialogTitle>
             <DialogDescription>
                To complete your order, please make a payment of <strong>₦{selectedKit?.price?.toLocaleString()}</strong> to the account below.
              </DialogDescription>
          </DialogHeader>
          
          {paymentSettings ? (
            <>
              <div className="bg-muted p-4 rounded-lg text-sm space-y-1">
                <p><strong>Bank:</strong> {paymentSettings.bankName}</p>
                <p><strong>Account Number:</strong> {paymentSettings.accountNumber}</p>
                <p><strong>Account Name:</strong> {paymentSettings.accountName}</p>
              </div>
              <div className="bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 p-4 rounded-lg text-sm space-y-2">
                <p className="font-semibold">Send your receipt to this number:</p>
                <div className="flex items-center gap-2">
                  <WhatsAppIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <span className="font-mono">{paymentSettings.whatsappNumber}</span>
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-4 py-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-16 w-full" />
            </div>
          )}

          <form onSubmit={handleSubmitOrder}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="shippingAddress" className="text-right">Shipping Address</Label>
                <Textarea 
                    id="shippingAddress" 
                    name="shippingAddress" 
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    className="col-span-3" 
                    required 
                    placeholder="Your full delivery address"
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting || !paymentSettings}>
                {isSubmitting ? 'Submitting...' : 'Submit Order'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
