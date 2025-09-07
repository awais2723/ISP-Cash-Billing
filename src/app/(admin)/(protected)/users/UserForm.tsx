'use client';

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { X, Trash2, Check } from "lucide-react";

import { cn } from "@/lib/utils"; // ✅ Import cn utility


// Shadcn UI Components
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

// Server Actions
import { createUser, updateUser, deleteUser } from "./actions";

// Prop Types
type Region = { id: string; name: string };
type User = {
  id: string;
  Fname: string;
  username: string;
  phone: string;
  role: "ADMIN" | "MANAGER" | "COLLECTOR";
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  assignments: { region_id: string }[];
};
interface UserFormProps {
  user?: User;
  regions: Region[];
  children: React.ReactNode; // Use children for the trigger
}

// Zod Schema
const userSchema = z.object({
  Fname: z.string().min(3, "Full name is required"),
  username: z.string().min(3, "Username is required"),
  phone: z.string().min(10, "A valid phone number is required"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .optional()
    .or(z.literal("")),
  role: z.enum(["ADMIN", "MANAGER", "COLLECTOR"]),
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]),
  regionIds: z.array(z.string()).optional(),
});

export function UserForm({ user, regions, children }: UserFormProps) {
  const [open, setOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof userSchema>>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      Fname: user?.Fname || "",
      username: user?.username || "",
      phone: user?.phone || "",
      role: user?.role || "COLLECTOR",
      status: user?.status || "ACTIVE",
      regionIds: user ? user.assignments.map((a) => a.region_id) : [],
    },
  });

  const selectedRole = watch("role");

  const onSubmit = async (data: z.infer<typeof userSchema>) => {
    try {
      const result = user
        ? await updateUser(user.id, data)
        : await createUser(data);
      if (result.success) {
        toast.success(result.message);
        setOpen(false);
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("An unexpected error occurred.");
    }
  };

  const handleDelete = async () => {
    if (!user) return;
    try {
      const result = await deleteUser(user.id);
      if (result.success) {
        toast.success(result.message);
        setIsDeleteDialogOpen(false);
        setOpen(false);
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("An unexpected error occurred during deletion.");
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="bg-white sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{user ? "Edit User" : "Create New User"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4">
              <Input placeholder="Full Name" {...register("Fname")} />
              {errors.Fname && (
                <p className="text-red-500 text-xs">{errors.Fname.message}</p>
              )}

              <Input placeholder="Username" {...register("username")} />
              {errors.username && (
                <p className="text-red-500 text-xs">
                  {errors.username.message}
                </p>
              )}

              <Input placeholder="Phone Number" {...register("phone")} />
              {errors.phone && (
                <p className="text-red-500 text-xs">{errors.phone.message}</p>
              )}

              <Input
                type="password"
                placeholder={user ? "New Password (optional)" : "Password"}
                {...register("password")}
              />
              {errors.password && (
                <p className="text-red-500 text-xs">
                  {errors.password.message}
                </p>
              )}

              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-slate-950 border shadow-lg z-50">
                      <SelectItem value="ADMIN">Admin</SelectItem>
                      <SelectItem value="MANAGER">Manager</SelectItem>
                      <SelectItem value="COLLECTOR">Collector</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />

              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-slate-950 border shadow-lg z-50">
                      <SelectItem value="ACTIVE">
                        <span className="flex items-center">
                          <span className="h-2 w-2 rounded-full bg-green-500 mr-2" />
                          Active
                        </span>
                      </SelectItem>
                      <SelectItem value="INACTIVE">
                        <span className="flex items-center">
                          <span className="h-2 w-2 rounded-full bg-yellow-500 mr-2" />
                          Inactive
                        </span>
                      </SelectItem>
                      <SelectItem value="SUSPENDED">
                        <span className="flex items-center">
                          <span className="h-2 w-2 rounded-full bg-red-500 mr-2" />
                          Suspended
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />

              {selectedRole === "COLLECTOR" && (
                <Controller
                  name="regionIds"
                  control={control}
                  render={({ field }) => (
                    <div className=" flex flex-col gap-2">
                      <Label>Assign Regions</Label>
                      <MultiSelect
                        
                        regions={regions}
                        selected={field.value || []}
                        onChange={field.onChange}
                      />
                    </div>
                  )}
                />
              )}
            </div>
            <DialogFooter className="flex flex-row justify-between w-full pt-4">
              <div>
                {user && (
                  <Button
                    className="bg-red-500 hover:bg-red-600 text-white mr-6 ml-12"
                    type="button"
                    variant="destructive"
                    onClick={() => setIsDeleteDialogOpen(true)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </Button>
                )}
              </div>
              <Button
                className="bg-blue-500 hover:bg-blue-600 text-white"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : user ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent className="bg-white dark:bg-slate-950 border shadow-lg z-50">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              user account and remove all their data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600 text-white mr-10 ml-12"
            >
              Confirm Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}



function MultiSelect({
  regions,
  selected,
  onChange,
}: {
  regions: Region[];
  selected: string[];
  onChange: (ids: string[]) => void;
}) {
  const [openPopover, setOpenPopover] = useState(false);

  const handleSelect = (regionId: string) => {
    const newSelected = selected.includes(regionId)
      ? selected.filter((id) => id !== regionId)
      : [...selected, regionId];
    onChange(newSelected);
  };

  const selectedRegions = regions.filter((r) => selected.includes(r.id));

  return (
    <Popover open={openPopover} onOpenChange={setOpenPopover}>
      <PopoverTrigger asChild>
        <div className="border rounded-md p-2 min-h-[40px] flex flex-wrap gap-1 items-center cursor-pointer">
          {selectedRegions.map((region) => (
            <Badge key={region.id} variant="secondary">
              {region.name}
              <X
                className="h-3 w-3 ml-1 cursor-pointer"
                onClick={(e) => { e.stopPropagation(); handleSelect(region.id); }}
              />
            </Badge>
          ))}
          {selectedRegions.length === 0 && (
            <span className="text-sm text-muted-foreground">Select regions...</span>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent className="bg-white w-[var(--radix-popover-trigger-width)] p-0">
        <Command>
          <CommandInput placeholder="Search regions..." />
          <CommandList>
            <CommandEmpty>No regions found.</CommandEmpty>
            <CommandGroup>
              {regions.map((region) => {
                const isSelected = selected.includes(region.id);
                return (
                  <CommandItem
                    key={region.id}
                    onSelect={() => handleSelect(region.id)}
                    className="cursor-pointer"
                  >
                    <div
                      className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                        isSelected ? "bg-primary text-primary-foreground" : "opacity-50 shrink-0"
                      )}
                    >
                      <Check className={cn("h-4 w-4", isSelected ? "opacity-100" : "opacity-0")} />
                    </div>
                    {region.name}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}