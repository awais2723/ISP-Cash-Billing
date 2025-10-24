"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";
import { runBillingEngine } from "./actions";
import { toast } from "sonner";

export function RunBillingButton() {
  const [isPending, startTransition] = useTransition();

  const handleRunBilling = () => {
    startTransition(async () => {
      const result = await runBillingEngine();
      if (result.success) {
        toast.success("Billing Engine Complete", {
          description: result.message,
        });
      } else {
        toast.error("Billing Engine Failed", {
          description: result.message,
        });
      }
    });
  };

  return (
    <Button
      className="bg-blue-600 hover:bg-blue-700 text-white"
      onClick={handleRunBilling}
      disabled={isPending}>
      <Zap className=" mr-2 h-4 w-4" />
      {isPending ? "Running..." : "Run Monthly Billing"}
    </Button>
  );
}
