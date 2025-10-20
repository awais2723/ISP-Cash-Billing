"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import Link from "next/link";
import {
  Wallet,
  Power,
  PowerOff,
  DollarSign,
  MapPin,
  AlertTriangle,
} from "lucide-react";
import { useSession } from "../SessionContext";

export default function CollectorDashboard() {
  const {
    activeSession,
    totalCollectedToday,
    assignedRegions,
    isLoading,
    openSession,
    closeSession,
  } = useSession();

  const [isCloseConfirmOpen, setIsCloseConfirmOpen] = useState(false);

  const handleConfirmClose = () => {
    if (activeSession) {
      closeSession(activeSession.id);
    }
    setIsCloseConfirmOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center p-8 text-muted-foreground">
          Loading Dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Collected Today
            </CardTitle>
            
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              PKR {totalCollectedToday.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              From all sessions today
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Assigned Regions
            </CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assignedRegions.length}</div>
            <p className="text-xs text-muted-foreground">Total service areas</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {activeSession ? "Session In Progress" : "Start Your Day"}
          </CardTitle>
          <CardDescription>
            {activeSession
              ? `Opened at: ${new Date(
                  activeSession.opened_at
                ).toLocaleTimeString()}`
              : "Activate a new session to begin collecting."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activeSession ? (
            <Button
              onClick={() => setIsCloseConfirmOpen(true)}
              variant="outline"
              className=" bg-red-700 text-white w-full">
              <PowerOff className=" mr-2 h-4 w-4" /> Close Session
            </Button>
          ) : (
            <Button
              onClick={openSession}
              className="w-full bg-green-600 hover:bg-green-700 text-white">
              <Power className="mr-2 h-4 w-4" /> Activate Session
            </Button>
          )}
        </CardContent>
      </Card>

      {activeSession ? (
        <Link href="/collector/collect" className="block">
          <Button
            size="lg"
            className="w-full h-16 text-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg">
            <Wallet className="mr-3 h-8 w-8" />
            Go to Collection List
          </Button>
        </Link>
      ) : (
        <div className="text-center p-4 bg-gray-100 rounded-lg">
          <p className="text-sm text-muted-foreground">
            Activate a session to begin collecting payments.
          </p>
        </div>
      )}

      {/* Confirmation Dialog */}
      <AlertDialog
        open={isCloseConfirmOpen}
        onOpenChange={setIsCloseConfirmOpen}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
              <AlertTriangle
                className="h-6 w-6 text-yellow-600"
                aria-hidden="true"
              />
            </div>
            <div className="mt-3 text-center sm:mt-5">
              <AlertDialogTitle>Confirm Close Session</AlertDialogTitle>
              <AlertDialogDescription className="mt-2">
                You have collected a total of:
                {/* ✅ FIX: Display the amount collected IN THIS SESSION */}
                <div className="text-2xl font-bold my-4 text-slate-800">
                  PKR{" "}
                  {activeSession?.collected_in_session?.toLocaleString() || 0}
                </div>
                Confirm to close and submit this amount for reconciliation.
              </AlertDialogDescription>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="grid grid-cols-2 gap-2 pt-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmClose}
              className="bg-blue-600 hover:bg-blue-700 text-white">
              Confirm & Close
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
