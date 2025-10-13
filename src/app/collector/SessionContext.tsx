"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { toast } from "sonner";

// Define the shape of data returned by the API
interface Region {
  id: string;
  name: string;
}
interface Session {
  id: string;
  opened_at: string;
  expected_total: number;
  collector_id: string;
}
interface DashboardData {
  assignedRegions: Region[];
  totalCollectedToday: number;
  activeSession: Session | null;
}

// Define the shape of the data provided by the context
interface SessionContextType {
  activeSession: Session | null;
  totalCollectedToday: number;
  assignedRegions: Region[];
  isLoading: boolean;
  openSession: () => Promise<void>;

  syncData: () => void;
  closeSession: (sessionId: string) => Promise<void>; // ✅ Expects a string ID
}

// Create the context
const SessionContext = createContext<SessionContextType | undefined>(undefined);

// Create the provider component
export function SessionProvider({ children }: { children: ReactNode }) {
  // This single state holds all the data for the dashboard
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  // Fetches the latest data from the server
  const syncData = useCallback(async () => {
    try {
      const res = await fetch("/api/collector/dashboard-summary");
      if (!res.ok) throw new Error("Failed to sync session with the server.");
      const data = await res.json();
      setDashboardData(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Sync failed");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // On initial load, fetch the data
  useEffect(() => {
    syncData();
  }, [syncData]);

  // Action to open a new session
  const openSession = async () => {
    const res = await fetch("/api/sessions/open", { method: "POST" });
    if (res.ok) {
      toast.success("New session started successfully!");
      await syncData(); // Refresh data after action
    } else {
      toast.error("Failed to open a new session.");
    }
  };

  // Action to close a session
  const closeSession = async (sessionId: string) => {
    const res = await fetch("/api/sessions/close", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    });
    if (res.ok) {
      toast.success("Session closed successfully.");
      await syncData();
    } else {
      toast.error("Failed to close session.");
    }
  };

  // The value provided to all consuming components
  const value: SessionContextType = {
    isLoading,
    openSession,
    closeSession,
    syncData,
    activeSession: dashboardData?.activeSession || null,
    totalCollectedToday: dashboardData?.totalCollectedToday || 0,
    assignedRegions: dashboardData?.assignedRegions || [],
  };

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

// Custom hook for easy consumption of the context
export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}
