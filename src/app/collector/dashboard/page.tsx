'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Circle } from 'lucide-react';
// You'll need these shadcn/ui components for the new layout
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

// Define the new Customer type that includes due status
interface Customer {
  id: string;
  Fname: string;
  address: string;
  hasDueInvoice: boolean;
}

const CACHE_KEY = 'collector_customers_cache';
const CACHE_DURATION = 1000 * 60 * 30; // 30 minutes

export default function CollectorDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [session, setSession] = useState<any>(null); // Use 'any' for simplicity or define a session type
  const [error, setError] = useState('');

  useEffect(() => {
    // Load active session from localStorage
    const activeSession = localStorage.getItem('active_session');
    if (activeSession) {
      setSession(JSON.parse(activeSession));
    }

    const fetchAndCacheCustomers = async () => {
      setError('');
      try {
        const response = await fetch('/api/collector/data');
        if (!response.ok) throw new Error('Failed to sync with server.');
        
        const freshData: Customer[] = await response.json();
        
        // Sort data with dues on top
        freshData.sort((a, b) => Number(b.hasDueInvoice) - Number(a.hasDueInvoice));
        
        setCustomers(freshData);
        
        // Update cache with fresh data and a timestamp
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          timestamp: Date.now(),
          data: freshData,
        }));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    // Initial load from cache
    const cachedItem = localStorage.getItem(CACHE_KEY);
    if (cachedItem) {
      const { timestamp, data } = JSON.parse(cachedItem);
      // Check if cache is still valid
      if (Date.now() - timestamp < CACHE_DURATION) {
        setCustomers(data);
        setIsLoading(false); // We have data, so stop initial loading indicator
        fetchAndCacheCustomers(); // Fetch fresh data in the background
        return;
      }
    }
    
    // If no valid cache, fetch from server
    fetchAndCacheCustomers();
  }, []);

  const handleOpenSession = async () => {
      const res = await fetch('/api/sessions/open', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
          localStorage.setItem('active_session', JSON.stringify(data));
          setSession(data);
      } else {
          alert('Failed to open session. Please try again.');
      }
  };
  
  return (
    <div className="space-y-4">
      {/* Session Management Card */}
      <Card>
        <CardContent className="p-4 text-center">
          {session ? (
            <div>
              <p className="font-semibold text-green-600">Session Active</p>
              <p className="text-xs text-muted-foreground">
                Opened at: {new Date(session.opened_at).toLocaleTimeString()}
              </p>
            </div>
          ) : (
            <div>
              <h2 className="text-lg font-semibold mb-2">Ready to Collect?</h2>
              <Button onClick={handleOpenSession} className="bg-green-600 hover:bg-green-700">
                Open New Cash Session
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Customer List Section */}
      <div>
        <h2 className="text-xl font-bold mb-2">Assigned Customers ({customers.length})</h2>
        {isLoading && <p>Loading customers...</p>}
        {error && <p className="text-red-500">{error}</p>}
        
        {!isLoading && !error && (
          <div className="space-y-2">
            {customers.map(customer => (
              <Link key={customer.id} href={`/collector/customers/${customer.id}`}>
                <div className="bg-white p-3 rounded-lg shadow cursor-pointer hover:bg-gray-50 flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{customer.Fname}</p>
                    <p className="text-sm text-gray-600">{customer.address}</p>
                  </div>
                  {/* Red dot indicator for dues */}
                  {customer.hasDueInvoice && (
                    <Circle className="h-3 w-3 text-red-500 fill-current" />
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

