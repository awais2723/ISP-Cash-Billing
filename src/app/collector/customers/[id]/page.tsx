"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "../../SessionContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { AddCustomInvoiceForm } from "./AddCustomInvoiceForm"; // Import the form

// Define types for state
interface Customer {
  id: string;
  Fname: string;
  address: string;
}
interface Invoice {
  id: string;
  period: string;
  category: string | null;
  notes: string | null;
  amount: number;
  extra_amount: number;
  paid_amount: number;
}

export default function CustomerDetailPage() {
  const { activeSession, syncData } = useSession();
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [data, setData] = useState<{
    customer: Customer;
    invoices: Invoice[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [amount, setAmount] = useState("");
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/customers/${id}`);
        if (response.ok) setData(await response.json());
        else toast.error("Failed to load customer details.");
      } catch (error) {
        toast.error("An error occurred while fetching data.");
      }
      setIsLoading(false);
    };
    fetchData();
  }, [id]);

  const handleInvoiceSelect = (invoiceId: string) => {
    setSelectedInvoices((prev) =>
      prev.includes(invoiceId)
        ? prev.filter((id) => id !== invoiceId)
        : [...prev, invoiceId]
    );
  };

  const handleCollectPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const paymentAmount = parseFloat(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      toast.warning("Please enter a valid amount.");
      return;
    }
    if (!activeSession) {
      toast.error("No active session found.");
      return;
    }
    if (selectedInvoices.length === 0) {
      toast.info("Please select at least one invoice to pay.");
      return;
    }

    setIsSubmitting(true);
    const paymentPayload = {
      amount: paymentAmount,
      customer_id: id,
      invoice_ids: selectedInvoices,
      cash_session_id: activeSession.id,
    };

    try {
      const response = await fetch("/api/payments/collect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Payment failed.");
      }

      await syncData();
      toast.success("Payment recorded successfully!");
      router.push("/collector/dashboard");
    } catch (error) {
      toast.error(
        `Error: ${error instanceof Error ? error.message : String(error)}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading)
    return <div className="text-center p-8">Loading Customer Details...</div>;
  if (!data) return <div className="text-center p-8">Customer not found.</div>;

  const { customer, invoices } = data;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          {/* ✅ Button is now in the top right corner */}
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl">{customer.Fname}</CardTitle>
              <CardDescription>{customer.address}</CardDescription>
            </div>
            <AddCustomInvoiceForm customerId={id} />
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Due Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {invoices.length > 0 ? (
              invoices.map((inv) => {
                const totalDue =
                  inv.amount + inv.extra_amount - inv.paid_amount;
                return (
                  <div
                    key={inv.id}
                    className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50">
                    {/* ✅ Checkbox added for multi-select */}
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id={inv.id}
                        onCheckedChange={() => handleInvoiceSelect(inv.id)}
                        checked={selectedInvoices.includes(inv.id)}
                      />
                      <Label
                        htmlFor={inv.id}
                        className="text-sm text-muted-foreground cursor-pointer">
                        {inv.period || inv.category}
                        {inv.notes && (
                          <span className="block text-xs italic text-gray-400">
                            {inv.notes}
                          </span>
                        )}
                      </Label>
                    </div>
                    <span className="font-bold text-red-600">
                      PKR {totalDue.toFixed(2)}
                    </span>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No outstanding dues.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* The payment form now only appears if an invoice is selected */}
      {selectedInvoices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Record Payment</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCollectPayment} className="space-y-4">
              <div>
                <Label htmlFor="payment_amount">Amount Received</Label>
                <Input
                  id="payment_amount"
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Processing..." : "Record Cash Payment"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
