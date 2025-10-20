import { loginUser } from './actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import { User, Lock } from 'lucide-react';
import hsLogo from '@/images/hs.png'; // Make sure the path to your new logo is correct

// The page now accepts searchParams to display error messages
export default function LoginPage({ searchParams }: { searchParams: { error: string } }) {
  const error = searchParams?.error;

  return (
    // The new gradient background
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 p-4">
      <div className="w-full max-w-md">
        {/* Logo and Branding Section */}
        <div className="flex flex-col items-center space-y-4 mb-8">
          <Image src={hsLogo} alt="HS-Network Logo" width={120} height={120} priority />
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
            HS-Network Portal
          </h1>
        </div>

        {/* Themed Login Card */}
        <Card className="w-full shadow-2xl rounded-2xl border-t-4 border-blue-600">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-800">Welcome Back</CardTitle>
            <CardDescription>Enter your credentials to access the panel.</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Error Message Display */}
            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-6" role="alert">
                <p className="font-bold">Login Failed</p>
                <p>{error}</p>
              </div>
            )}

            <form action={loginUser} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username" className="font-semibold">Username</Label>
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
                <Label htmlFor="password" className="font-semibold">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input 
                    id="password" 
                    name="password" 
                    type="password" 
                    required 
                    className="pl-10 h-12 text-base" 
                  />
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full h-12 text-lg text-white font-bold bg-blue-600 hover:bg-blue-700"
              >
                Sign In
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}