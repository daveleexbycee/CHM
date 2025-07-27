
"use client";

import React, { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [paymentSettings, setPaymentSettings] = useState({
    bankName: "",
    accountNumber: "",
    accountName: "",
    whatsappNumber: "",
  });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, "settings", "payment");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setPaymentSettings(docSnap.data() as any);
        }
      } catch (error) {
          console.error("Error fetching payment settings:", error);
          toast({ title: "Error", description: "Could not load payment settings.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [toast]);

  const handlePaymentSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPaymentSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSavePaymentSettings = async () => {
    setIsSaving(true);
    try {
      await setDoc(doc(db, "settings", "payment"), paymentSettings, { merge: true });
      toast({ title: "Success", description: "Payment settings have been updated." });
    } catch (error: any) {
      toast({ title: "Error", description: `Failed to save settings: ${error.message}`, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };


  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Site Settings</h1>
        <p className="text-muted-foreground">Manage global configuration for your website.</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Payment Settings</CardTitle>
            <CardDescription>
              Manage the bank details and WhatsApp number for order payments.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
              {loading ? (
                <div className="space-y-4">
                    <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full" /></div>
                    <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full" /></div>
                    <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full" /></div>
                    <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full" /></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                    <Label htmlFor="bankName">Bank Name</Label>
                    <Input id="bankName" name="bankName" value={paymentSettings.bankName} onChange={handlePaymentSettingsChange} placeholder="e.g., Opay" />
                    </div>
                    <div className="space-y-2">
                    <Label htmlFor="accountName">Account Name</Label>
                    <Input id="accountName" name="accountName" value={paymentSettings.accountName} onChange={handlePaymentSettingsChange} placeholder="e.g., CHM FC Merchandise" />
                    </div>
                    <div className="space-y-2">
                    <Label htmlFor="accountNumber">Account Number</Label>
                    <Input id="accountNumber" name="accountNumber" value={paymentSettings.accountNumber} onChange={handlePaymentSettingsChange} placeholder="e.g., 8161440195" />
                    </div>
                    <div className="space-y-2">
                    <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
                    <Input id="whatsappNumber" name="whatsappNumber" value={paymentSettings.whatsappNumber} onChange={handlePaymentSettingsChange} placeholder="e.g., 08161440195" />
                    </div>
                </div>
              )}
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button onClick={handleSavePaymentSettings} disabled={isSaving || loading}>
                {isSaving ? "Saving..." : "Save Payment Settings"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
