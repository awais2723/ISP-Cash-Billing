'use client';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// Define types for state
interface Customer {
  id: string;
  Fname: string;
  address: string;
}
interface Invoice {
  id: string;
  period: string;
  total_due: number;
  paid_amount: number;
}

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [data, setData] = useState<{ customer: Customer; invoices: Invoice[] } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      setIsLoading(true);
      const response = await fetch(`/api/customers/${id}`);
      if (response.ok) {
        const fetchedData = await response.json();
        setData(fetchedData);
      }
      setIsLoading(false);
    };
    fetchData();
  }, [id]);

  const handleCollectPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const paymentAmount = parseFloat(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      alert('Please enter a valid amount.');
      return;
    }
    
    const activeSession = JSON.parse(localStorage.getItem('active_session'));
    if(!activeSession) {
        alert('No active session found. Please go to the dashboard.');
        return;
    }
    if (!data || data.invoices.length === 0) {
        alert('No due invoices for this customer.');
        return;
    }

    setIsSubmitting(true);
    const paymentPayload = {
      amount: paymentAmount,
      customer_id: id,
      invoice_ids: [data.invoices[0].id], // Apply to the first due invoice
      cash_session_id: activeSession.id,
      collector_id: activeSession.collector_id,
    };
    
    try {
        const response = await fetch('/api/payments/collect', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(paymentPayload),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Payment failed.');
        }

        alert('Payment successful!');
        router.push('/dashboard');
    } catch (error) {
        alert(`Error: ${error.message}`);
    } finally {
        setIsSubmitting(false);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (!data) return <div>Customer not found.</div>;

  const { customer, invoices } = data;

  return (
    <div>
      <h2 className="text-2xl font-bold">{customer.Fname}</h2>
      <p className="text-gray-600 mb-4">{customer.address}</p>
      
      <div className="bg-white p-4 rounded shadow mb-4">
        <h3 className="font-semibold">Due Invoices</h3>
        {invoices.length > 0 ? invoices.map(inv => (
            <div key={inv.id} className="flex justify-between items-center py-1">
                <span>Period: {inv.period}</span>
                <span className="font-bold">PKR {(inv.total_due - inv.paid_amount).toFixed(2)}</span>
            </div>
        )) : <p>No outstanding dues.</p>}
      </div>
      
      {invoices.length > 0 && (
        <form onSubmit={handleCollectPayment}>
          <input 
              type="number"
              step="0.01"
              value={amount} 
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount" 
              className="w-full p-2 border rounded mb-2"
              required
          />
          <button 
            type="submit" 
            className="w-full bg-green-500 text-white p-2 rounded disabled:bg-gray-400"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Processing...' : 'Record Cash Payment'}
          </button>
        </form>
      )}
    </div>
  );
}