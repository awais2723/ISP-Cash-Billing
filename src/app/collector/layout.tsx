'use client';

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { LogOut, ChevronLeft } from "lucide-react";
import { logout } from "@/app/actions";
import hsLogo from "@/images/hs.png"; // Make sure this path is correct
import { SessionProvider } from "./SessionContext";

export default function CollectorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  // ✅ Only show the back button if we are NOT on the main collector dashboard
  const showBackButton = pathname !== "/collector/dashboard";

  return (
    <SessionProvider>
      <div className="max-w-md mx-auto min-h-screen bg-gray-50 flex flex-col">
        {/* ✅ Header updated with new design, colors, logo, and back button */}
        <header className="bg-gray-800 text-white p-3 flex justify-between items-center shadow-md sticky top-0 z-10">
          <div className="w-1/4">
            {showBackButton && (
              <button
                onClick={() => router.back()}
                className="p-2 rounded-full hover:bg-gray-700 transition-colors"
                aria-label="Go back">
                <ChevronLeft size={24} />
              </button>
            )}
          </div>

          <div className="w-1/2 flex justify-center">
            <Link
              href="/collector/dashboard"
              className="flex items-center gap-2">
              <Image src={hsLogo} alt="Logo" width={60} height={50} />
              <span className="font-bold text-lg hidden sm:inline">
                HS-Network
              </span>
            </Link>
          </div>

          <div className="w-1/4 flex justify-end">
            <form action={logout}>
              <button
                type="submit"
                className="p-2 rounded-full hover:bg-gray-700 transition-colors"
                aria-label="Logout">
                <LogOut size={20} />
              </button>
            </form>
          </div>
        </header>

        <main className="flex-1 p-4">{children}</main>
      </div>
    </SessionProvider>
  );
}