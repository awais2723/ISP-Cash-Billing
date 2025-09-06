import prisma from '@/lib/prisma';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CustomerForm } from './CustomerForm';

export default async function CustomersPage() {
  const customers = await prisma.customer.findMany({
    include: {
      plan: true,
      region: true,
    },
    orderBy: {
      Fname: 'asc'
    }
  });

  const plans = await prisma.plan.findMany();
  const regions = await prisma.region.findMany();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Manage Customers</CardTitle>
        <CustomerForm plans={plans} regions={regions} />
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Full Name</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Region</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell>{customer.Fname}</TableCell>
                <TableCell>{customer.username}</TableCell>
                <TableCell>{customer.plan.name}</TableCell>
                <TableCell>{customer.region.name}</TableCell>
                <TableCell>{customer.status}</TableCell>
                <TableCell>
                   <CustomerForm 
                      customer={customer} 
                      plans={plans} 
                      regions={regions} 
                    />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}