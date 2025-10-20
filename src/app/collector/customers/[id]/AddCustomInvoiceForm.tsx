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

interface AddCustomInvoiceFormProps {
  customerId: string;
  onInvoiceAdded: () => void; // Callback function type
}

export function AddCustomInvoiceForm({
  customerId,
  onInvoiceAdded,
}: AddCustomInvoiceFormProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const result = await createCustomInvoice(formData);
      if (result.success) {
        toast.success(result.message);
        onInvoiceAdded();
        setOpen(false);
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-500 hover:bg-blue-600 text-white" size="sm">
          <PlusCircle className="mr-2 h-4 w-4" />
          {/* Shows "Add Charge" on small screens */}
          <span className="sm:hidden">Add Charge</span>
          {/* Shows "Add Custom Charge" on screens larger than 'sm' */}
          <span className="hidden sm:inline">Add Custom Charge</span>
        </Button>
      </DialogTrigger>
      {/* Increased max width slightly for better spacing on small screens */}
      <DialogContent className="bg-white sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Add Custom Invoice</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <input type="hidden" name="customerId" value={customerId} />
          <div>
            <Label htmlFor="category">Category</Label>
            <Select name="category" required>
              <SelectTrigger>
                <SelectValue placeholder="Select a category..." />
              </SelectTrigger>

              <SelectContent className="bg-white border shadow-lg z-[100]">
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
            <Label htmlFor="notes"> Notes (Optional)</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="e.g., Replaced faulty cable..."
              disabled={isPending}
            />
          </div>

          {/* ✅ FIX: Changed button color to match CustomerForm */}
          <Button
            type="submit"
            disabled={isPending}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white">
            {isPending ? "Adding..." : "Add Invoice"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
