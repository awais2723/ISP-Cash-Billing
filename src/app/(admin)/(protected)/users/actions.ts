'use server';

import { z } from "zod";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

// Re-usable password hashing function
async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

// Zod schema for validation
const userSchema = z.object({
  Fname: z.string().min(3, "Full name is required"),
  username: z.string().min(3, "Username is required"),
  phone: z.string().min(10, "A valid phone number is required"),
  // Make password optional for updates, but required for creation
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .optional()
    .or(z.literal("")),
  role: z.enum(["ADMIN", "MANAGER", "COLLECTOR"]),
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]),
  regionIds: z.array(z.string()).optional(),
});

/**
 * Creates a new user in the database.
 */
export async function createUser(data: z.infer<typeof userSchema>) {
  const validatedFields = userSchema.safeParse(data);
  if (!validatedFields.success) {
    return { success: false, message: "Invalid form data." };
  }

  const { Fname, username, phone, password, role, status, regionIds } =
    validatedFields.data;

  if (!password || password.length < 6) {
    return {
      success: false,
      message: "Password is required and must be at least 6 characters.",
    };
  }

  try {
    const hashedPassword = await hashPassword(password);

    await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          Fname,
          username,
          phone,
          password: hashedPassword,
          role,
          status,
        },
      });

      if (role === "COLLECTOR" && regionIds && regionIds.length > 0) {
        await tx.assignment.createMany({
          data: regionIds.map((regionId) => ({
            user_id: newUser.id,
            region_id: regionId,
            active_from: new Date(),
          })),
        });
      }
    });

    revalidatePath("/users");
    return { success: true, message: "User created successfully." };
  } catch (error: any) {
    console.error(error);
    if (error.code === "P2002") {
      // Prisma unique constraint violation
      return {
        success: false,
        message: "Username or phone number already exists.",
      };
    }
    return {
      success: false,
      message: "Database Error: Failed to Create User.",
    };
  }
}

/**
 * Updates an existing user's information.
 */
export async function updateUser(id: string, data: z.infer<typeof userSchema>) {
  const validatedFields = userSchema.safeParse(data);
  if (!validatedFields.success) {
    return { success: false, message: "Invalid form data." };
  }

  const { Fname, username, phone, password, role, status, regionIds } =
    validatedFields.data;

  try {
    const userDataUpdate: any = { Fname, username, phone, role, status };

    if (password && password.length >= 6) {
      userDataUpdate.password = await hashPassword(password);
    }

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id },
        data: userDataUpdate,
      });

      // Always remove old assignments first
      await tx.assignment.deleteMany({ where: { user_id: id } });

      if (role === "COLLECTOR" && regionIds && regionIds.length > 0) {
        // Create new assignments if they exist
        await tx.assignment.createMany({
          data: regionIds.map((regionId) => ({
            user_id: id,
            region_id: regionId,
            active_from: new Date(),
          })),
        });
      }
    });

    revalidatePath("/users");
    return { success: true, message: "User updated successfully." };
  } catch (error: any) {
    console.error(error);
    if (error.code === "P2002") {
      return {
        success: false,
        message: "Username or phone number already exists.",
      };
    }
    return {
      success: false,
      message: "Database Error: Failed to Update User.",
    };
  }
}

/**
 * Deletes a user from the database.
 */
export async function deleteUser(userId: string) {
  // ✅ 1. Add initial input validation
  if (!userId) {
    return { success: false, message: "User ID is missing." };
  }

  try {
    // The transaction is a great way to ensure data integrity
    await prisma.$transaction(async (tx) => {
      // First, delete all assignments related to this user
      await tx.assignment.deleteMany({
        where: { user_id: userId },
      });

      // Then, attempt to delete the user
      await tx.user.delete({
        where: { id: userId },
      });
    });

    revalidatePath("/users");
    return { success: true, message: "User deleted successfully." };
  } catch (error) {
    // ✅ 2. Add specific error handling
    console.error("Failed to delete user:", error); // Keep this for debugging

    // P2003 is the Prisma error code for a foreign key constraint violation
    if (typeof error === "object" && error !== null && "code" in error && (error as any).code === "P2003") {
      return {
        success: false,
        message:
          "Cannot delete this user. They are still linked to existing payments, cash sessions, or other records.",
      };
    }

    // Fallback for any other type of error
    return {
      success: false,
      message: "Database Error: Failed to delete user.",
    };
  }
}