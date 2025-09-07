'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState } from 'react';
import { createPlan, updatePlan } from './actions';
import { toast } from "sonner";
import { Plan } from '@prisma/client';

interface PlanFormProps {
    plan?: Plan;
    children: React.ReactNode;
}

const planSchema = z.object({
  name: z.string().min(3, 'Plan name is required.'),
  monthly_charge: z.coerce.number().min(0, 'Monthly charge must be a positive number.'),
  company: z.string().min(2, 'Provider name is required.').optional(),
  purch_price: z.coerce.number().min(0).optional().default(0),
  is_active: z.boolean().default(true),
});

export function PlanForm({ plan, children }: PlanFormProps) {
  const [open, setOpen] = useState(false);

  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm<z.infer<typeof planSchema>>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      name: plan?.name || '',
      monthly_charge: plan?.monthly_charge || 0,
      company: plan?.company || '',
      purch_price: plan?.purch_price || 0,
      is_active: plan?.is_active ?? true,
    },
  });

  const onSubmit: (data: z.infer<typeof planSchema>) => Promise<void> = async (data) => {
    try {
      const result = plan ? await updatePlan(plan.id, data) : await createPlan(data);
      if (result.success) {
        toast.success(result.message);
        setOpen(false);
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error('An unexpected error occurred.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="opacity-100 bg-white">
        <DialogHeader>
          <DialogTitle>{plan ? 'Edit Plan' : 'Create New Plan'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div>
            <Label htmlFor="name">Plan Name</Label>
            <Input id="name" {...register('name')} />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <Label htmlFor="company">Provider Name</Label>
            <Input id="company" {...register('company')} />
            {errors.company && <p className="text-red-500 text-sm mt-1">{errors.company.message}</p>}
          </div>

          <div>
            <Label htmlFor="monthly_charge">Monthly Charge (PKR)</Label>
            <Input id="monthly_charge" type="number" step="0.01" {...register('monthly_charge')} />
            {errors.monthly_charge && <p className="text-red-500 text-sm mt-1">{errors.monthly_charge.message}</p>}
          </div>
          
       <div className="flex items-center space-x-2 pt-2">
  <Controller
    name="is_active"
    control={control}
    render={({ field }) => (
      // Wrap in a fragment to return multiple elements
      <>
        <Switch
          id="is_active"
          checked={field.value}
          onCheckedChange={field.onChange}
          className="data-[state=checked]:bg-green-200 data-[state=unchecked]:bg-gray-200"
        />
        {/* ✅ The Label now reads the switch's value */}
        <Label htmlFor="is_active" className="cursor-pointer">
          {field.value ? 'Plan is Active' : 'Plan is Deactivated'}
        </Label>
      </>
    )}
  />
</div>
          
          <Button type="submit" disabled={isSubmitting} className="mt-2 bg-blue-500 hover:bg-blue-600 text-white">
            {isSubmitting ? 'Saving...' : (plan ? 'Update Plan' : 'Create Plan')}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}