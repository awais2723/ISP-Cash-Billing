import prisma from '@/lib/prisma';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserForm } from './UserForm';
import { Prisma } from '@prisma/client'; // ✅ Import Prisma

// ✅ Define a type for a user with their assignments included
type UserWithAssignments = Prisma.UserGetPayload<{
  include: {
    assignments: {
      include: {
        region: true;
      };
    };
  };
}>;
export default async function UsersPage() {
  const users = await prisma.user.findMany({
    include: {
      assignments: {
        include: {
          region: true,
        },
      },
    },
    orderBy: {
      Fname: 'asc',
    },
  });

  const regions = await prisma.region.findMany();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Manage Users</CardTitle>
        <UserForm regions={regions} />
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Full Name</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Assigned Regions</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.Fname}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell><Badge variant="outline">{user.role}</Badge></TableCell>
                <TableCell><Badge variant={user.status === 'ACTIVE' ? 'default' : 'secondary'}>{user.status}</Badge></TableCell>
                <TableCell className="flex flex-wrap gap-1">
                  {user.assignments.map(assignment => (
                    <Badge key={assignment.id} variant="secondary">{assignment.region.name}</Badge>
                  ))}
                </TableCell>
                <TableCell className="text-right">
                   <UserForm user={user} regions={regions} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}