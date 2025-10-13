"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { createCustomInvoice } from "./actions";
import { PlusCircle } from "lucide-react";

export function AddCustomInvoiceForm({ customerId }: { customerId: string }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const result = await createCustomInvoice(formData);
      if (result.success) {
        toast.success(result.message);
        setOpen(false);
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <PlusCircle className="mr-2 h-4 w-4" /> Add Custom Charge
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle>Add Custom Invoice</DialogTitle>
        </DialogHeader>
        {/* ✅ The form now calls our new handler */}
        <form action={handleSubmit} className="space-y-4">
          <input type="hidden" name="customerId" value={customerId} />
          <div>
            <Label htmlFor="category">Category</Label>
            <Select name="category" required>
              <SelectTrigger>
                <SelectValue placeholder="Select a category..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="New Connection">New Connection</SelectItem>
                <SelectItem value="Repairing">Repairing</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="amount">Amount (PKR)</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              step="0.01"
              required
              disabled={isPending}
            />
          </div>

          <div>
            <Label htmlFor="notes">Description / Notes (Optional)</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="e.g., Replaced faulty cable..."
              disabled={isPending}
            />
          </div>

          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? "Adding..." : "Add Invoice"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
