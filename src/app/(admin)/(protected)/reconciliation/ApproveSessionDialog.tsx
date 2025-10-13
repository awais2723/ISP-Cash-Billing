"use client";

import { useState, useActionState, useEffect } from "react";
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
import { approveSession } from "./actions";
import { toast } from "sonner";

interface ApproveSessionDialogProps {
  session: {
    id: string;
    counted_total: number | null; // ✅ Expect the counted_total
  };
  children: React.ReactNode;
}

const initialState = { success: false, message: "" };

export function ApproveSessionDialog({
  session,
  children,
}: ApproveSessionDialogProps) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(approveSession, initialState);

  useEffect(() => {
    if (state.message) {
      state.success ? toast.success(state.message) : toast.error(state.message);
      if (state.success) setOpen(false);
    }
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle>Confirm & Approve Session</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            The collector has submitted a total of:
          </p>
          {/* ✅ FIX: Display the 'counted_total' for verification */}
          <p className="text-3xl font-bold text-center py-4 text-slate-800">
            PKR {(session.counted_total ?? 0).toLocaleString()}
          </p>
          <form action={formAction}>
            <input type="hidden" name="sessionId" value={session.id} />
            <div className="space-y-2">
              <Label htmlFor="admin_counted_amount">
                Enter the cash amount you received to confirm:
              </Label>
              <Input
                id="admin_counted_amount"
                name="admin_counted_amount"
                type="number"
                step="0.01"
                placeholder="e.g., 5250.00"
                required
              />
            </div>
            <Button type="submit" className="w-full mt-4">
              Confirm & Approve
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
