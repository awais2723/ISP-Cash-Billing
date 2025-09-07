import prisma from '@/lib/prisma';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { approveSession } from './actions';
import { Badge } from '@/components/ui/badge';

const getStatusVariant = (status: string) => {
    if (status === 'APPROVED') return 'bg-green-100 text-green-800';
    if (status === 'CLOSED') return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
};

export default async function ReconciliationPage() {
  const sessions = await prisma.cashSession.findMany({
    where: { status: { in: ['CLOSED', 'APPROVED'] } },
    include: { collector: { select: { Fname: true } } },
    orderBy: { closed_at: 'desc' },
  });

  return (
    <div className="flex flex-col gap-4">
      <header>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Reconciliation</h1>
        <p className="text-muted-foreground">Approve daily cash sessions from collectors.</p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>Cash Sessions</CardTitle>
          <CardDescription>Review and approve submitted cash collections.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* ✅ DESKTOP VIEW: A standard table, hidden on mobile */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Collector</TableHead>
                  <TableHead>Closed At</TableHead>
                  <TableHead>Expected</TableHead>
                  <TableHead>Counted</TableHead>
                  <TableHead>Variance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell className="font-medium">{session.collector.Fname}</TableCell>
                    <TableCell>{session.closed_at?.toLocaleString()}</TableCell>
                    <TableCell>{`PKR ${session.expected_total.toFixed(2)}`}</TableCell>
                    <TableCell>{`PKR ${session.counted_total?.toFixed(2)}`}</TableCell>
                    <TableCell className={session.variance !== 0 ? 'text-red-600 font-bold' : ''}>
                      {`PKR ${session.variance?.toFixed(2)}`}
                    </TableCell>
                    <TableCell><Badge className={getStatusVariant(session.status)}>{session.status}</Badge></TableCell>
                    <TableCell className="text-right">
                      {session.status === 'CLOSED' && (
                        <form
                          action={async (formData) => {
                            await approveSession(formData);
                          }}
                        >
                          <input type="hidden" name="sessionId" value={session.id} />
                          <Button size="sm" type="submit">Approve</Button>
                        </form>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* ✅ MOBILE VIEW: A list of cards, hidden on desktop */}
          <div className="block md:hidden space-y-4">
            {sessions.map((session) => (
              <Card key={session.id} className="w-full">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">{session.collector.Fname}</CardTitle>
                    <Badge className={getStatusVariant(session.status)}>{session.status}</Badge>
                  </div>
                  <CardDescription>{session.closed_at?.toLocaleString()}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between"><span>Expected:</span> <span className="font-medium">{`PKR ${session.expected_total.toFixed(2)}`}</span></div>
                  <div className="flex justify-between"><span>Counted:</span> <span className="font-medium">{`PKR ${session.counted_total?.toFixed(2)}`}</span></div>
                  <div className={`flex justify-between ${session.variance !== 0 ? 'text-red-600 font-bold' : ''}`}>
                    <span>Variance:</span> 
                    <span className="font-medium">{`PKR ${session.variance?.toFixed(2)}`}</span>
                  </div>
                </CardContent>
                {session.status === 'CLOSED' && (
                  <CardFooter>
                    <form
                      action={async (formData) => {
                        await approveSession(formData);
                      }}
                      className="w-full"
                    >
                      <input type="hidden" name="sessionId" value={session.id} />
                      <Button size="sm" type="submit" className="w-full">Approve</Button>
                    </form>
                  </CardFooter>
                )}
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}