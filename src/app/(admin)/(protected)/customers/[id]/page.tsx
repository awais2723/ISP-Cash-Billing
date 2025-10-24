import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft, User, MapPin, File, Phone, Calendar } from "lucide-react";
import { Prisma } from "@prisma/client";

// Helper function to format currency
const formatCurrency = (amount: number | null) =>
  `PKR ${(amount ?? 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

// Helper function for status badge colors
const getStatusVariant = (status: string) => {
  if (status === "ACTIVE") return "bg-green-100 text-green-800";
  if (status === "INACTIVE") return "bg-yellow-100 text-yellow-800";
  if (status === "SUSPENDED") return "bg-red-100 text-red-800";
  return "bg-gray-100 text-gray-800";
};

// Define types for our data
type PaymentWithDetails = Prisma.PaymentGetPayload<{
  include: {
    collector: { select: { Fname: true } };
    invoice: { select: { period: true; category: true } };
  };
}>;

type InvoiceWithDetails = Prisma.InvoiceGetPayload<{}>;

export default async function CustomerDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;

  const customer = await prisma.customer.findUnique({
    where: { id: id },
    include: {
      region: { select: { name: true } },
      plan: { select: { name: true } },
      payments: {
        include: {
          collector: { select: { Fname: true } },
          invoice: { select: { period: true, category: true } },
        },
        orderBy: { received_at: "desc" },
      },
      invoices: {
        orderBy: { due_date: "desc" },
      },
    },
  });

  if (!customer) {
    notFound();
  }

  const outstandingInvoices = customer.invoices.filter(
    (inv) => inv.status === "DUE" || inv.status === "PARTIAL"
  );
  const totalOutstandingDue = outstandingInvoices.reduce((sum, inv) => {
    return sum + (inv.amount + inv.extra_amount) - inv.paid_amount;
  }, 0);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center gap-4">
        <Link href="/customers">
          <Button variant="outline" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Customer Details
          </h1>
          <p className="text-muted-foreground">
            Profile and billing history for {customer.Fname}.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* --- Customer Profile Card --- */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-xl">{customer.Fname}</CardTitle>
            <CardDescription>@{customer.username}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <InfoItem
              icon={User}
              label="Status"
              value={
                <Badge className={getStatusVariant(customer.status)}>
                  {customer.status}
                </Badge>
              }
            />
            <InfoItem icon={Phone} label="Phone" value={customer.phone} />
            <InfoItem icon={MapPin} label="Address" value={customer.address} />
            <InfoItem
              icon={MapPin}
              label="Region"
              value={customer.region?.name || "N/A"}
            />
            <InfoItem
              icon={File}
              label="Plan"
              value={customer.plan?.name || "N/A"}
            />
            <InfoItem
              icon={Calendar}
              label="Customer Since"
              value={customer.createdAt.toLocaleDateString()}
            />
          </CardContent>
        </Card>

        {/* --- Financial Summary Card --- */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Financial Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <p className="text-sm font-medium text-muted-foreground">
                Total Outstanding Dues
              </p>
              <p className="text-4xl font-bold text-red-600">
                {formatCurrency(totalOutstandingDue)}
              </p>
            </div>

            <h4 className="font-semibold mb-2">Currently Due Invoices</h4>
            {/* ✅ This section is now responsive */}
            <div className="rounded-lg border">
              {/* DESKTOP TABLE */}
              <Table className="hidden sm:table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Date Due</TableHead>
                    <TableHead className="text-right">Amount Due</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {outstandingInvoices.length > 0 ? (
                    outstandingInvoices.map((invoice: InvoiceWithDetails) => (
                      <TableRow key={invoice.id}>
                        <TableCell>
                          {invoice.period || invoice.category}
                        </TableCell>
                        <TableCell>
                          {invoice.due_date.toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(
                            invoice.amount +
                              invoice.extra_amount -
                              invoice.paid_amount
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="text-center text-muted-foreground">
                        No outstanding dues.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              {/* MOBILE CARD LIST */}
              <div className="sm:hidden">
                {outstandingInvoices.length > 0 ? (
                  outstandingInvoices.map((invoice: InvoiceWithDetails) => (
                    <div
                      key={invoice.id}
                      className="flex justify-between items-center p-4 border-b last:border-b-0">
                      <div>
                        <p className="font-medium">
                          {invoice.period || invoice.category}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Due: {invoice.due_date.toLocaleDateString()}
                        </p>
                      </div>
                      <div className="font-medium text-red-600">
                        {formatCurrency(
                          invoice.amount +
                            invoice.extra_amount -
                            invoice.paid_amount
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground p-4">
                    No outstanding dues.
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* --- Payment History Card --- */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>
            A complete log of all payments received from this customer.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* ✅ This section is now responsive */}
          <div className="rounded-lg border">
            {/* DESKTOP TABLE */}
            <Table className="hidden sm:table">
              <TableHeader>
                <TableRow>
                  <TableHead>Receipt #</TableHead>
                  <TableHead>Date Paid</TableHead>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Collected By</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customer.payments.length > 0 ? (
                  customer.payments.map((payment: PaymentWithDetails) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-mono text-xs">
                        {payment.receipt_no}
                      </TableCell>
                      <TableCell>
                        {payment.received_at.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {payment.invoice?.period ||
                          payment.invoice?.category ||
                          "N/A"}
                      </TableCell>
                      <TableCell>{payment.collector?.Fname || "N/A"}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(payment.amount)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-muted-foreground">
                      No payment history found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            {/* MOBILE CARD LIST */}
            <div className="sm:hidden">
              {customer.payments.length > 0 ? (
                customer.payments.map((payment: PaymentWithDetails) => (
                  <div
                    key={payment.id}
                    className="flex justify-between items-center p-4 border-b last:border-b-0">
                    <div>
                      <p className="font-medium">
                        {formatCurrency(payment.amount)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Paid to {payment.collector?.Fname || "N/A"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Ref: {payment.receipt_no}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        {new Date(payment.received_at).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(payment.received_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground p-4">
                  No payment history found.
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper component for the info list
function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex">
      <Icon className="h-4 w-4 text-muted-foreground mr-3 mt-1 flex-shrink-0" />
      <div className="flex-grow">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <div className="text-sm font-semibold">{value}</div>
      </div>
    </div>
  );
}
