import prisma from '@/lib/prisma';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { approveSession } from './actions';
import { Badge } from '@/components/ui/badge';

export default async function ReconciliationPage() {
  const sessions = await prisma.cashSession.findMany({
    where: {
      status: { in: ['CLOSED', 'APPROVED'] } // Show both for history
    },
    include: {
      collector: { select: { Fname: true } },
    },
    orderBy: {
      closed_at: 'desc',
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cash Session Reconciliation</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Collector</TableHead>
              <TableHead>Closed At</TableHead>
              <TableHead>Expected</TableHead>
              <TableHead>Counted</TableHead>
              <TableHead>Variance</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions.map((session) => (
              <TableRow key={session.id}>
                <TableCell>{session.collector.Fname}</TableCell>
                <TableCell>{session.closed_at?.toLocaleString()}</TableCell>
                <TableCell>PKR {session.expected_total.toFixed(2)}</TableCell>
                <TableCell>PKR {session.counted_total?.toFixed(2)}</TableCell>
                <TableCell 
                  className={session.variance !== 0 ? 'text-red-600 font-bold' : ''}>
                  PKR {session.variance?.toFixed(2)}
                </TableCell>
                <TableCell>
                  <Badge variant={session.status === 'APPROVED' ? 'default' : 'secondary'}>
                    {session.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {session.status === 'CLOSED' && (
                    <form action={approveSession}>
                      <input type="hidden" name="sessionId" value={session.id} />
                      <Button size="sm" type="submit">Approve</Button>
                    </form>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}