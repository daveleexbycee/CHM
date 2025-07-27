
"use client";

import * as React from "react";
import Link from "next/link";
import { collection, onSnapshot, doc, updateDoc, query, orderBy } from "firebase/firestore";
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
import { MoreHorizontal, FileCheck, Truck, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const StatusBadge = ({ status }: { status: string }) => {
  const variant = status === "Pending" ? "secondary" 
                  : status === "Shipped" ? "default" 
                  : status === "Delivered" ? "default"
                  : "outline";
  const color = status === "Delivered" ? "bg-green-600" : "";
  return <Badge variant={variant} className={color}>{status}</Badge>;
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = React.useState<any[]>([]);
  const { toast } = useToast();

  React.useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("orderDate", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const orderDoc = doc(db, "orders", orderId);
    try {
        await updateDoc(orderDoc, { status: newStatus });
        toast({ title: "Order Status Updated", description: `Order marked as ${newStatus}.` });
    } catch (error: any) {
        toast({ title: "Error", description: `Failed to update status: ${error.message}`, variant: "destructive" });
    }
  };

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Order Management</h1>
        </div>
        <Card>
          <CardHeader>
              <CardTitle>All Orders</CardTitle>
              <CardDescription>View and process customer orders.</CardDescription>
          </CardHeader>
          <CardContent>
              <Table>
              <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>
                        <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
              </TableHeader>
              <TableBody>
                  {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>{new Date(order.orderDate).toLocaleDateString()}</TableCell>
                    <TableCell className="font-medium">
                        <div>{order.userName}</div>
                        <div className="text-xs text-muted-foreground">{order.shippingAddress}</div>
                    </TableCell>
                    <TableCell>{order.productName}</TableCell>
                    <TableCell>₦{order.price.toLocaleString()}</TableCell>
                    <TableCell>
                        <StatusBadge status={order.status} />
                    </TableCell>
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
                                <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                                <DropdownMenuItem onSelect={() => updateOrderStatus(order.id, 'Pending')}>
                                    <FileCheck className="mr-2 h-4 w-4" />Mark as Pending
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => updateOrderStatus(order.id, 'Shipped')}>
                                    <Truck className="mr-2 h-4 w-4" />Mark as Shipped
                                </DropdownMenuItem>
                                 <DropdownMenuItem onSelect={() => updateOrderStatus(order.id, 'Delivered')}>
                                    <CheckCircle className="mr-2 h-4 w-4" />Mark as Delivered
                                </DropdownMenuItem>
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
    </>
  );
}
