'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CustomerForm } from './CustomerForm';
import { Edit, Search, Inbox } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { type Plan, type Region } from '@prisma/client';
import { Prisma } from '@prisma/client';
import Link from "next/link";

type CustomerWithDetails = Prisma.CustomerGetPayload<{
  include: { plan: true; region: true };
}>;

const getStatusVariant = (status: string) => {
    if (status === 'ACTIVE') return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300';
    return 'bg-gray-100 text-gray-800 dark:bg-gray-900/40 dark:text-gray-300';
};

interface CustomerListProps {
  customers: CustomerWithDetails[];
  totalCustomers: number;
  totalPages: number;
  plans: Plan[];
  regions: Region[];
}

export function CustomerList({ customers, totalCustomers, totalPages, plans, regions }: CustomerListProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const currentPage = Number(searchParams.get('page')) || 1;

  const createPageURL = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', '1');
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
    <div className="flex flex-col gap-4">
      <header>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Customer Management
        </h1>
        <p className="text-muted-foreground">
          Search, filter, and manage customer details.
        </p>
      </header>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>All Customers ({totalCustomers})</CardTitle>
              <CardDescription>
                A list of all registered customers.
              </CardDescription>
            </div>
            <CustomerForm plans={plans} regions={regions}>
              <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                Add Customer
              </Button>
            </CustomerForm>
          </div>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search by name or username..."
                className="pl-10"
                onChange={(e) => handleSearch(e.target.value)}
                defaultValue={searchParams.get("search")?.toString()}
              />
            </div>
            <Select
              onValueChange={(value) => handleFilterChange("region", value)}
              defaultValue={searchParams.get("region") || "all"}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by region..." />
              </SelectTrigger>

              <SelectContent className="bg-white dark:bg-slate-950 border shadow-lg z-50">
                <SelectItem value="all">All Regions</SelectItem>
                {regions.map((region) => (
                  <SelectItem key={region.id} value={region.id}>
                    {region.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              onValueChange={(value) => handleFilterChange("plan", value)}
              defaultValue={searchParams.get("plan") || "all"}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by plan..." />
              </SelectTrigger>

              <SelectContent className="bg-white dark:bg-slate-950 border shadow-lg z-50">
                <SelectItem value="all">All Plans</SelectItem>
                {plans.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id}>
                    {plan.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {customers.length === 0 ? (
            <div className="text-center py-12">
              <Inbox className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold">No customers found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          ) : (
            <>
              {/* DESKTOP VIEW */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Full Name</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Region</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell className="font-medium">
                          <Link
                            href={`/customers/${customer.id}`}
                            className="hover:underline text-blue-600">
                            {customer.Fname}
                          </Link>
                        </TableCell>
                        <TableCell>{customer.username}</TableCell>
                        <TableCell>{customer.plan.name}</TableCell>
                        <TableCell>{customer.region.name}</TableCell>
                        <TableCell>
                          <Badge className={getStatusVariant(customer.status)}>
                            {customer.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <CustomerForm
                            customer={customer}
                            plans={plans}
                            regions={regions}>
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </CustomerForm>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {/* MOBILE VIEW */}
              <div className="block md:hidden space-y-4">
                {customers.map((customer) => (
                  <Card key={customer.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">
                            <Link
                              href={`/customers/${customer.id}`}
                              className="hover:underline text-blue-600">
                              {customer.Fname}
                            </Link>
                          </CardTitle>
                          <CardDescription>
                            @{customer.username}
                          </CardDescription>
                        </div>
                        <Badge className={getStatusVariant(customer.status)}>
                          {customer.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Region:</span>{" "}
                        <span className="font-medium">
                          {customer.region.name}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Plan:</span>{" "}
                        <span className="font-medium">
                          {customer.plan.name}
                        </span>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <CustomerForm
                        customer={customer}
                        plans={plans}
                        regions={regions}>
                        <Button variant="outline" className="w-full">
                          Edit Customer
                        </Button>
                      </CustomerForm>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </>
          )}
        </CardContent>
        {totalPages > 1 && (
          <CardFooter>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href={createPageURL(currentPage - 1)}
                    aria-disabled={currentPage <= 1}
                    className={
                      currentPage <= 1
                        ? "pointer-events-none opacity-50"
                        : undefined
                    }
                  />
                </PaginationItem>
                <PaginationItem className="font-medium text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    href={createPageURL(currentPage + 1)}
                    aria-disabled={currentPage >= totalPages}
                    className={
                      currentPage >= totalPages
                        ? "pointer-events-none opacity-50"
                        : undefined
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}