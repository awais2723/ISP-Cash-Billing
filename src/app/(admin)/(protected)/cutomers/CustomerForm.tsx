'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFormState } from 'react-dom';
import { createCustomer, updateCustomer } from './actions';
import { useEffect, useState } from 'react';

// Define types based on your Prisma schema
type Plan = { id: string; name: string; };
type Region = { id: string; name: string; };
type Customer = { id: string; Fname: string; username: string; phone: string; address: string; plan_id: string; region_id: string; };

interface CustomerFormProps {
    customer?: Customer;
    plans: Plan[];
    regions: Region[];
}

export function CustomerForm({ customer, plans, regions }: CustomerFormProps) {
  const [open, setOpen] = useState(false);
  
  const action = customer ? updateCustomer.bind(null, customer.id) : createCustomer;
  const [state, formAction] = useFormState(action, { message: '' });

  useEffect(() => {
    if (state?.success) {
      setOpen(false);
    }
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={customer ? 'ghost' : 'default'}>{customer ? 'Edit' : 'Add Customer'}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{customer ? 'Edit Customer' : 'Create New Customer'}</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="grid gap-4 py-4">
          <Input name="Fname" placeholder="Full Name" defaultValue={customer?.Fname} required />
          <Input name="username" placeholder="Username" defaultValue={customer?.username} required />
          <Input name="phone" placeholder="Phone Number" defaultValue={customer?.phone} required />
          <Input name="address" placeholder="Address" defaultValue={customer?.address} required />
          
          <Select name="plan_id" defaultValue={customer?.plan_id} required>
            <SelectTrigger><SelectValue placeholder="Select a plan" /></SelectTrigger>
            <SelectContent>
              {plans.map(plan => <SelectItem key={plan.id} value={plan.id}>{plan.name}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select name="region_id" defaultValue={customer?.region_id} required>
            <SelectTrigger><SelectValue placeholder="Select a region" /></SelectTrigger>
            <SelectContent>
              {regions.map(region => <SelectItem key={region.id} value={region.id}>{region.name}</SelectItem>)}
            </SelectContent>
          </Select>
          
          <Button type="submit"> {customer ? 'Update' : 'Create'} Customer </Button>
          {state?.message && <p className="text-red-500 text-sm">{state.message}</p>}
        </form>
      </DialogContent>
    </Dialog>
  );
}