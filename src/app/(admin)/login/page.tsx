"use client"; // ✅ 1. Mark as Client Component

import * as React from "react";
import { useState } from "react"; // ✅ Import useState
import { loginUser } from "./actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { User, Lock, Eye, EyeOff } from "lucide-react"; // ✅ 2. Import Eye icons
import hsLogo from "@/images/hs.png";

interface LoginPageProps {
  searchParams?: { error?: string };
}
interface UnwrappedSearchParams {
  error?: string;
}

export default function LoginPage({ searchParams }: LoginPageProps) {
  const unwrappedSearchParams = React.use(
    searchParams || {}
  ) as UnwrappedSearchParams;
  const error = unwrappedSearchParams?.error;

  // ✅ 3. Add state for password visibility
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center space-y-4 mb-8">
          <Image
            src={hsLogo}
            alt="HS-Network Logo"
            width={120}
            height={120}
            priority
          />
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
            HS-Network Portal
          </h1>
        </div>
        <Card className="w-full shadow-2xl rounded-2xl border-t-4 border-blue-600">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-800">
              Welcome Back
            </CardTitle>
            <CardDescription>
              Enter your credentials to access the panel.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div
                className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-6"
                role="alert">
                <p className="font-bold">Login Failed</p>
                <p>{error}</p>
              </div>
            )}
            <form action={loginUser} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username" className="font-semibold">
                  Username
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="e.g., adminuser"
                    required
                    className="pl-10 h-12 text-base"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="font-semibold">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  {/* ✅ 5. Conditionally set input type */}
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    className="pl-10 pr-10 h-12 text-base" // Added padding-right
                  />
                  {/* ✅ 4. Add the toggle button */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 hover:text-gray-600"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }>
                    {/* ✅ 5. Conditionally render the icon */}
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full h-12 text-lg text-white font-bold bg-blue-600 hover:bg-blue-700">
                Sign In
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
