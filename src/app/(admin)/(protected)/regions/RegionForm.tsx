'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState } from 'react';
import { createRegion, updateRegion } from './actions';
import { toast } from "sonner";
import { Region } from '@prisma/client';

interface RegionFormProps {
    region?: Region;
    allRegions: Region[];
    children: React.ReactNode;
}

const regionSchema = z.object({
  name: z.string().min(2, 'Region name must be at least 2 characters.'),
  parent_id: z.string().optional(),
});

export function RegionForm({ region, allRegions, children }: RegionFormProps) {
  const [open, setOpen] = useState(false);
  
  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm<z.infer<typeof regionSchema>>({
    resolver: zodResolver(regionSchema),
    defaultValues: {
      name: region?.name || '',
      parent_id: region?.parent_id || 'none',
    },
  });

  const onSubmit = async (data: z.infer<typeof regionSchema>) => {
    try {
      const result = region ? await updateRegion(region.id, data) : await createRegion(data);
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
      <DialogContent className="opacity-100 bg-white ">
        <DialogHeader>
          <DialogTitle>{region ? 'Edit Region' : 'Create New Region'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div>
            <Label htmlFor="name">Region Name</Label>
            <Input id="name" {...register('name')} />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <Label htmlFor="parent_id">Parent Region (Optional)</Label>
            <Controller
                name="parent_id"
                control={control}
                render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger><SelectValue placeholder="Select a parent region" /></SelectTrigger>
                        <SelectContent className='bg-white'>
                            <SelectItem value="none">None</SelectItem>
                            {allRegions.filter(r => r.id !== region?.id).map(parentRegion => (
                                <SelectItem key={parentRegion.id} value={parentRegion.id}>
                                    {parentRegion.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
            />
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : (region ? 'Update Region' : 'Create Region')}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}