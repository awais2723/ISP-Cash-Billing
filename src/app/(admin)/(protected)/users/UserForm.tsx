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
import { createUser, updateUser } from './actions';
import { toast } from "sonner" 
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

// Define types based on your Prisma schema to pass as props
type Region = { id: string; name: string; };
type User = { 
    id: string; 
    Fname: string; 
    username: string; 
    phone: string;
    role: 'ADMIN' | 'MANAGER' | 'COLLECTOR';
    status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
    assignments: { region_id: string }[];
};

interface UserFormProps {
    user?: User;
    regions: Region[];
}

// Zod schema for validation
const userSchema = z.object({
  Fname: z.string().min(3, 'Full name is required'),
  username: z.string().min(3, 'Username is required'),
  phone: z.string().min(10, 'A valid phone number is required'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional().or(z.literal('')),
  role: z.enum(['ADMIN', 'MANAGER', 'COLLECTOR']),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']),
  regionIds: z.array(z.string()).optional(),
});

export function UserForm({ user, regions }: UserFormProps) {
  const [open, setOpen] = useState(false);

  const { register, handleSubmit, control, watch, formState: { errors, isSubmitting } } = useForm<z.infer<typeof userSchema>>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      Fname: user?.Fname || '',
      username: user?.username || '',
      phone: user?.phone || '',
      role: user?.role || 'COLLECTOR',
      status: user?.status || 'ACTIVE',
      regionIds: user?.assignments.map(a => a.region_id) || [],
    },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: z.infer<typeof userSchema>) => {
    try {
      const result = user ? await updateUser(user.id, data) : await createUser(data);
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
      <DialogTrigger asChild>
        <Button variant={user ? 'ghost' : 'default'}>{user ? 'Edit' : 'Add User'}</Button>
      </DialogTrigger>
      {/* ✅ FIX APPLIED HERE */}
      <DialogContent className="opacity-100 bg-white">
        <DialogHeader>
          <DialogTitle>{user ? 'Edit User' : 'Create New User'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <Input placeholder="Full Name" {...register('Fname')} />
          {errors.Fname && <p className="text-red-500 text-sm">{errors.Fname.message}</p>}

          <Input placeholder="Username" {...register('username')} />
          {errors.username && <p className="text-red-500 text-sm">{errors.username.message}</p>}

          <Input placeholder="Phone Number" {...register('phone')} />
          {errors.phone && <p className="text-red-500 text-sm">{errors.phone.message}</p>}

          <Input type="password" placeholder={user ? "New Password (optional)" : "Password"} {...register('password')} />
          {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}

          <Controller name="role" control={control} render={({ field }) => (
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="MANAGER">Manager</SelectItem>
                <SelectItem value="COLLECTOR">Collector</SelectItem>
              </SelectContent>
            </Select>
          )} />

          <Controller name="status" control={control} render={({ field }) => (
            <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                    <SelectItem value="SUSPENDED">Suspended</SelectItem>
                </SelectContent>
            </Select>
          )} />
          
          {selectedRole === 'COLLECTOR' && (
            <Controller name="regionIds" control={control} render={({ field }) => (
              <div>
                  <Label>Assign Regions</Label>
                  <MultiSelect regions={regions} selected={field.value || []} onChange={field.onChange} />
              </div>
            )} />
          )}
          
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : (user ? 'Update User' : 'Create User')}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// A simple multi-select component built with shadcn primitives
function MultiSelect({ regions, selected, onChange }: { regions: Region[], selected: string[], onChange: (ids: string[]) => void }) {
    const [openPopover, setOpenPopover] = useState(false);
    
    const handleSelect = (regionId: string) => {
        const newSelected = selected.includes(regionId) 
            ? selected.filter(id => id !== regionId) 
            : [...selected, regionId];
        onChange(newSelected);
    };

    const selectedRegions = regions.filter(r => selected.includes(r.id));

    return (
        <Popover open={openPopover} onOpenChange={setOpenPopover}>
            <PopoverTrigger asChild>
                <div className="border rounded-md p-2 min-h-[40px] flex flex-wrap gap-1 items-center cursor-pointer">
                    {selectedRegions.map(region => (
                        <Badge key={region.id} variant="secondary">
                            {region.name}
                            <X className="h-3 w-3 ml-1 cursor-pointer" onClick={(e) => { e.stopPropagation(); handleSelect(region.id); }} />
                        </Badge>
                    ))}
                    {selectedRegions.length === 0 && <span className="text-sm text-muted-foreground">Select regions...</span>}
                </div>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                <Command>
                    <CommandInput placeholder="Search regions..." />
                    <CommandList>
                        <CommandEmpty>No regions found.</CommandEmpty>
                        <CommandGroup>
                            {regions.map((region) => (
                                <CommandItem key={region.id} onSelect={() => handleSelect(region.id)}>
                                    <span className={`mr-2 h-4 w-4 rounded-sm border ${selected.includes(region.id) ? 'bg-primary' : ''}`} />
                                    {region.name}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}