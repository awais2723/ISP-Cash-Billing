import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import Link from "next/link";
import { Users, FileText, Map, UserX, TrendingUp } from "lucide-react";

// Define the available reports
const reportOptions = [
  {
    title: "Outstanding Dues",
    description: "List of all customers with a current outstanding balance.",
    href: "/reports/outstanding-dues",
    icon: Users,
  },
  {
    title: "Customer Billing Summary",
    description: "Overview of billing status for all active customers.",
    href: "/reports/billing-summary",
    icon: FileText,
  },
  {
    title: "Regional Performance",
    description: "Monthly collections and variance analysis by region.",
    href: "/reports/regional-performance",
    icon: Map,
  },
  {
    title: "Collector Performance",
    description: "Track collected amounts and session variances per collector.",
    href: "/reports/collector-performance",
    icon: TrendingUp,
  },
  {
    title: "Inactive Customers",
    description: "List of customers marked as inactive.",
    href: "/reports/inactive-customers",
    icon: UserX,
  },
  // Note: "Single Customer Billing History" is best viewed directly on the Customer Detail page or Customer List page.
];

export default function ReportsPage() {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Reports
        </h1>
        <p className="text-muted-foreground">
          View operational and financial performance reports.
        </p>
      </header>

      {/* Grid layout for report options */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportOptions.map((report) => (
          <Link href={report.href} key={report.href}>
            <Card className="hover:shadow-lg hover:border-blue-500 transition-all duration-200 h-full flex flex-col">
              <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                <report.icon className="h-8 w-8 text-blue-600" />
                <div className="flex-1">
                  <CardTitle>{report.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <CardDescription>{report.description}</CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <p className="text-sm text-muted-foreground mt-4">
        Note: Detailed **Single Customer Billing History** can be accessed via
        the main Customers list.
      </p>
    </div>
  );
}
