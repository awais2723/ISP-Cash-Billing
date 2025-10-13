'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Phone, FileText, MapPin } from 'lucide-react';
import Link from 'next/link';

// Define types
interface Customer {
  id: string;
  Fname: string;
  username: string;
  phone: string;
  address: string;
  dues: number;
  region: { name: string };
}
interface Region { id: string; name: string; }

interface CustomerListPageProps {
  customers: Customer[];
  regions: Region[];
}

export function CustomerListPage({ customers, regions }: CustomerListPageProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value && value !== 'all') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    replace(`${pathname}?${params.toString()}`);
  };

  const handleSearch = useDebouncedCallback((term: string) => {
    handleFilterChange('search', term);
  }, 300);

  return (
    <div className="space-y-4">
      {/* ✅ REMOVED: Redundant back button is now gone */}
      <header>
          <h1 className="text-2xl font-bold tracking-tight">Collection List</h1>
          <p className="text-muted-foreground">Search and select a customer to collect payment.</p>
      </header>

      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Search by name or username..." 
              className="pl-10"
              onChange={(e) => handleSearch(e.target.value)}
              defaultValue={searchParams.get('search')?.toString()}
            />
          </div>
          <Select onValueChange={(value) => handleFilterChange('region', value)} defaultValue={searchParams.get('region') || 'all'}>
            <SelectTrigger><SelectValue placeholder="Filter by region..." /></SelectTrigger>
            <SelectContent className="bg-white z-50">
              <SelectItem value="all">All Assigned Regions</SelectItem>
              {regions.map(region => <SelectItem key={region.id} value={region.name}>{region.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
      
      <div className="space-y-3">
        {customers.map(customer => (
          <Card key={customer.id} className={customer.dues > 0 ? "border-red-500 border-2" : ""}>
            <CardHeader>
              <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{customer.Fname}</CardTitle>
                  <div className="text-right">
                      <p className="font-bold text-lg text-red-600">PKR {customer.dues.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Total Due</p>
                  </div>
              </div>
              <CardDescription>@{customer.username}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center text-sm text-muted-foreground">
                <Phone className="h-4 w-4 mr-2" /> {customer.phone}
              </div>
              <div className="flex items-start text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mr-2 mt-0.5 shrink-0" /> 
                <span>{customer.address}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Link href={`/collector/customers/${customer.id}`} className="w-full">
                <Button className="w-full">
                  <FileText className="mr-2 h-4 w-4" /> Collect Payment / View Invoices
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}