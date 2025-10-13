import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth.server";
import { CustomerListPage } from "./CustomerListPage";

// ✅ This is the required default export for the page
export default async function CollectPage({
  searchParams,
}: {
  searchParams?: { search?: string; region?: string };
}) {
  const session = await getSession();
  if (!session) {
    return <div className="p-4 text-center">Unauthorized</div>;
  }

  const search = searchParams?.search || "";
  const regionNameFilter = searchParams?.region || "";

  const assignments = await prisma.assignment.findMany({
    where: { user_id: session.userId },
    include: { region: true },
  });
  const assignedRegions = assignments.map((a) => a.region);
  const assignedRegionIds = assignedRegions.map((r) => r.id);

  let customers = await prisma.customer.findMany({
    where: { region_id: { in: assignedRegionIds }, status: "ACTIVE" },
    select: {
      id: true,
      Fname: true,
      username: true,
      phone: true,
      address: true,
      region: { select: { name: true } },
    },
  });
  const customerIds = customers.map((c) => c.id);
  const invoices = await prisma.invoice.findMany({
    where: {
      customer_id: { in: customerIds },
      status: { in: ["DUE", "PARTIAL"] },
    },
    select: {
      customer_id: true,
      amount: true,
      extra_amount: true,
      paid_amount: true,
    },
  });
  const dueMap = new Map<string, number>();
  invoices.forEach((inv) => {
    const due = inv.amount + inv.extra_amount - inv.paid_amount;
    dueMap.set(inv.customer_id, (dueMap.get(inv.customer_id) || 0) + due);
  });
  let customersWithDues = customers.map((customer) => ({
    ...customer,
    dues: dueMap.get(customer.id) || 0,
  }));

  if (search) {
    customersWithDues = customersWithDues.filter(
      (c) =>
        c.Fname.toLowerCase().includes(search.toLowerCase()) ||
        c.username.toLowerCase().includes(search.toLowerCase())
    );
  }
  if (regionNameFilter && regionNameFilter !== "all") {
    customersWithDues = customersWithDues.filter(
      (c) => c.region.name === regionNameFilter
    );
  }

  customersWithDues.sort((a, b) => b.dues - a.dues);

  return (
    <CustomerListPage customers={customersWithDues} regions={assignedRegions} />
  );
}
