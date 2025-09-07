import prisma from '@/lib/prisma';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserForm } from './UserForm';
import { Prisma } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';

type UserWithAssignments = Prisma.UserGetPayload<{
  include: { assignments: { include: { region: true } } };
}>;

// Helper function for status badge colors
const getStatusVariant = (status: string) => {
    if (status === 'ACTIVE') return 'bg-green-100 text-green-800';
    if (status === 'INACTIVE') return 'bg-yellow-100 text-yellow-800';
    if (status === 'SUSPENDED') return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
};

export default async function UsersPage() {
  const users: UserWithAssignments[] = await prisma.user.findMany({
    include: { assignments: { include: { region: true } } },
    orderBy: { Fname: 'asc' },
  });
  const regions = await prisma.region.findMany();

  return (
    <div className="flex flex-col gap-4">
      <header>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground">Manage admin, manager, and collector accounts.</p>
      </header>
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>All Users</CardTitle>
            <CardDescription>A list of all users in the system.</CardDescription>
          </div>
          {/* ✅ "Add User" button is now passed as a child to UserForm */}
          <UserForm regions={regions}>
            <Button className='bg-blue-500 hover:bg-blue-600 text-white'>Add User</Button>
          </UserForm>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Full Name</TableHead>
                  <TableHead className="hidden md:table-cell">Username</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Assigned Regions</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.Fname}</TableCell>
                    <TableCell className="hidden md:table-cell">{user.username}</TableCell>
                    <TableCell><Badge variant="outline">{user.role}</Badge></TableCell>
                    <TableCell>
                      <Badge className={getStatusVariant(user.status)}>{user.status}</Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {user.assignments.map(assignment => (
                          <Badge key={assignment.id} variant="secondary">{assignment.region.name}</Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                       {/* ✅ "Edit" icon button is passed as a child */}
                       <UserForm user={user} regions={regions}>
                         <Button variant="ghost" size="icon">
                           <Edit className="h-4 w-4" />
                         </Button>
                       </UserForm>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}