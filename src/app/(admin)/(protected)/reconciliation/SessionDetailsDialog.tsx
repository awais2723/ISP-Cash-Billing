"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Eye } from "lucide-react";

interface PaymentDetail {
  id: string;
  amount: number;
  received_at: string;
  customer: {
    Fname: string;
    username: string;
  };
}

export function SessionDetailsDialog({ sessionId }: { sessionId: string }) {
  const [open, setOpen] = useState(false);
  const [payments, setPayments] = useState<PaymentDetail[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPayments = async () => {
    if (payments.length > 0) return; // Don't re-fetch if already loaded

    setIsLoading(true);
    try {
      const response = await fetch(`/api/sessions/${sessionId}/payments`);
      if (!response.ok) throw new Error("Failed to load details.");
      const data = await response.json();
      setPayments(data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" onClick={fetchPayments}>
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl bg-white">
        <DialogHeader>
          <DialogTitle>Session Payment Details</DialogTitle>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            <p>Loading details...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      <div className="font-medium">
                        {payment.customer.Fname}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        @{payment.customer.username}
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(payment.received_at).toLocaleTimeString()}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      PKR {payment.amount.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
