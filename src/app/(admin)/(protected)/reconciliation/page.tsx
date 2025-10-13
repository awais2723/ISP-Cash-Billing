import prisma from "@/lib/prisma";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ApproveSessionDialog } from "./ApproveSessionDialog";
import { SessionDetailsDialog } from "./SessionDetailsDialog";
import { Prisma } from "@prisma/client"; // ✅ Import Prisma for types

// ✅ Define a precise type for the session data
type SessionWithCollector = Prisma.CashSessionGetPayload<{
  include: { collector: { select: { Fname: true } } };
}>;

const getStatusVariant = (status: string) => {
  if (status === "APPROVED") return "bg-green-100 text-green-800";
  if (status === "CLOSED") return "bg-yellow-100 text-yellow-800";
  return "bg-gray-100 text-gray-800";
};

export default async function ReconciliationPage() {
  const sessions: SessionWithCollector[] = await prisma.cashSession.findMany({
    where: { status: { in: ["CLOSED", "APPROVED"] } },
    include: { collector: { select: { Fname: true } } },
    orderBy: { closed_at: "desc" },
  });

  // ✅ Helper for currency formatting
  const formatCurrency = (amount: number | null) =>
    `PKR ${(amount ?? 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  return (
    <div className="flex flex-col gap-4">
      <header>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Reconciliation
        </h1>
        <p className="text-muted-foreground">
          Approve daily cash sessions from collectors.
        </p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>Cash Sessions</CardTitle>
          <CardDescription>
            Review and approve submitted cash collections.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* DESKTOP VIEW */}
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
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell className="font-medium">
                      {session.collector.Fname}
                    </TableCell>
                    <TableCell>{session.closed_at?.toLocaleString()}</TableCell>
                    <TableCell>
                      {formatCurrency(session.expected_total)}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(session.counted_total)}
                    </TableCell>
                    <TableCell
                      className={
                        session.variance !== 0 ? "text-red-600 font-bold" : ""
                      }>
                      {formatCurrency(session.variance)}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusVariant(session.status)}>
                        {session.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {/* ✅ Wrapped actions in a flex container for proper alignment */}
                      <div className="flex items-center justify-end gap-2">
                        <SessionDetailsDialog sessionId={session.id} />
                        {session.status === "CLOSED" && (
                          <ApproveSessionDialog session={session}>
                            <Button size="sm">Approve</Button>
                          </ApproveSessionDialog>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* MOBILE VIEW */}
          <div className="block md:hidden space-y-4">
            {sessions.map((session) => (
              <Card key={session.id} className="w-full">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">
                      {session.collector.Fname}
                    </CardTitle>
                    <Badge className={getStatusVariant(session.status)}>
                      {session.status}
                    </Badge>
                  </div>
                  <CardDescription>
                    {session.closed_at?.toLocaleString()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Expected:</span>{" "}
                    <span className="font-medium">
                      {formatCurrency(session.expected_total)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Counted:</span>{" "}
                    <span className="font-medium">
                      {formatCurrency(session.counted_total)}
                    </span>
                  </div>
                  <div
                    className={`flex justify-between ${
                      session.variance !== 0 ? "text-red-600 font-bold" : ""
                    }`}>
                    <span>Variance:</span>
                    <span className="font-medium">
                      {formatCurrency(session.variance)}
                    </span>
                  </div>
                </CardContent>
                {/* ✅ Corrected footer layout for mobile buttons */}
                <CardFooter className="flex gap-2">
                  <SessionDetailsDialog sessionId={session.id} />
                  {session.status === "CLOSED" && (
                    <ApproveSessionDialog session={session}>
                      <Button size="sm" className="flex-grow">
                        Approve
                      </Button>
                    </ApproveSessionDialog>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
