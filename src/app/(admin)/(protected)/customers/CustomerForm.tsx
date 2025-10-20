"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState, useActionState } from "react";
import { createCustomer, updateCustomer, deleteCustomer } from "./actions";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Status } from "@prisma/client";

type Plan = { id: string; name: string };
type Region = { id: string; name: string };
type Customer = {
  id: string;
  Fname: string;
  username: string;
  phone: string;
  address: string;
  plan_id: string;
  region_id: string;
  status: Status;
};

interface CustomerFormProps {
  customer?: Customer;
  plans: Plan[];
  regions: Region[];
  children: React.ReactNode;
}

export function CustomerForm({
  customer,
  plans,
  regions,
  children,
}: CustomerFormProps) {
  const [open, setOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const action = customer
    ? updateCustomer.bind(null, customer.id)
    : createCustomer;
  const [state, formAction] = useActionState(action, {
    success: false,
    message: "",
  });

  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast.success(state.message);
        setOpen(false);
      } else {
        toast.error(state.message);
      }
    }
  }, [state]);

  const handleDelete = async () => {
    if (!customer) return;
    const result = await deleteCustomer(customer.id);
    if (result.success) {
      toast.success(result.message);
      setIsDeleteDialogOpen(false);
      setOpen(false);
    } else {
      toast.error(result.message);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="opacity-100 bg-white">
          <DialogHeader>
            <DialogTitle>
              {customer ? "Edit Customer" : "Create New Customer"}
            </DialogTitle>
          </DialogHeader>
          {/* ✅ FIX: The key prop forces the form to reset its state when re-opened */}
          <form key={customer?.id || "new-customer"} action={formAction}>
            <div className="grid gap-4 py-4">
              <Input
                name="Fname"
                placeholder="Full Name"
                defaultValue={customer?.Fname}
                required
              />
              <Input
                name="username"
                placeholder="Username"
                defaultValue={customer?.username}
                required
              />
              <Input
                name="phone"
                placeholder="Phone Number"
                defaultValue={customer?.phone}
                required
              />
              <Input
                name="address"
                placeholder="Address"
                defaultValue={customer?.address}
                required
              />
              <Select name="plan_id" defaultValue={customer?.plan_id} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a plan" />
                </SelectTrigger>
                <SelectContent className="bg-white z-[60]">
                  {plans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                name="region_id"
                defaultValue={customer?.region_id}
                required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a region" />
                </SelectTrigger>
                <SelectContent className="bg-white z-[60]">
                  {regions.map((region) => (
                    <SelectItem key={region.id} value={region.id}>
                      {region.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {customer && (
                <Select name="status" defaultValue={customer.status}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white z-[60]">
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              )}
              {state?.message && !state.success && (
                <p className="text-red-500 text-sm pt-2">{state.message}</p>
              )}
            </div>
            <DialogFooter className="flex flex-row justify-between w-full pt-4">
              <div>
                {customer && (
                  <Button
                    className="bg-red-500 hover:bg-red-600 text-white"
                    type="button"
                    variant="destructive"
                    onClick={() => setIsDeleteDialogOpen(true)}>
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </Button>
                )}
              </div>
              <Button
                className="bg-blue-500 hover:bg-blue-600 text-white"
                type="submit">
                {customer ? "Update Customer" : "Create Customer"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="opacity-100 bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the customer "{customer?.Fname}".
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700">
              Confirm Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
