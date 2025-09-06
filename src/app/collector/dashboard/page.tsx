'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

// Define the Customer type
interface Customer {
  id: string;
  Fname: string;
  address: string;
}

export default function CollectorDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [session, setSession] = useState(null);
  const [error, setError] = useState('');

  // Fetch initial data (session and customers)
  useEffect(() => {
    const activeSession = localStorage.getItem('active_session');
    if (activeSession) {
      setSession(JSON.parse(activeSession));
    }

    const fetchCustomers = async () => {
      setIsLoading(true);
      setError('');
      try {
        const response = await fetch('/api/collector/data');
        if (!response.ok) throw new Error('Failed to fetch customers.');
        const data = await response.json();
        setCustomers(data.customers);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCustomers();
  }, []);

  const handleOpenSession = async () => {
      setIsLoading(true);
      const res = await fetch('/api/sessions/open', { method: 'POST' });
      const data = await res.json();
      if(res.ok) {
          localStorage.setItem('active_session', JSON.stringify(data));
          setSession(data);
      } else {
          alert('Failed to open session.');
      }
      setIsLoading(false);
  };
  
  if (!session) {
      return <div className="text-center">
          <h2 className="text-lg font-semibold mb-4">No Active Session</h2>
          <button onClick={handleOpenSession} disabled={isLoading} className="bg-green-500 text-white px-4 py-2 rounded disabled:bg-gray-400">
              {isLoading ? 'Please wait...' : 'Open New Cash Session'}
          </button>
      </div>
  }

  if (isLoading) return <div>Loading customers...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-2">Assigned Customers ({customers.length})</h2>
      <div className="space-y-2">
        {customers.map(customer => (
          <Link key={customer.id} href={`/customers/${customer.id}`}>
            <div className="bg-white p-3 rounded shadow cursor-pointer hover:bg-gray-50">
              <p className="font-semibold">{customer.Fname}</p>
              <p className="text-sm text-gray-600">{customer.address}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}