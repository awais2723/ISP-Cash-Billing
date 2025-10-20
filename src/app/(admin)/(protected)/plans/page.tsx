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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlanForm } from "./PlanForm";
import { DeletePlanDialog } from "./DeletePlanDialog";
import { Edit, Trash2 } from "lucide-react";
import { Plan } from "@prisma/client";

const getStatusVariant = (isActive: boolean) => {
  return isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800";
};

export default async function PlansPage() {
  const plans = await prisma.plan.findMany({
    orderBy: { name: "asc" },
  });

  const formatCurrency = (amount: number | null) =>
    `PKR ${(amount ?? 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  return (
    <div className="flex flex-col gap-4">
      <header>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Service Plans
        </h1>
        <p className="text-muted-foreground">
          Manage customer subscription plans.
        </p>
      </header>
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>All Plans</CardTitle>
            <CardDescription>
              A list of all available service plans.
            </CardDescription>
          </div>
          <PlanForm>
            {/* ✅ Corrected button color */}
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              Add New Plan
            </Button>
          </PlanForm>
        </CardHeader>
        <CardContent>
          {/* DESKTOP VIEW */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plan Name</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Monthly Charge</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plans.map((plan: Plan) => (
                  <TableRow key={plan.id}>
                    <TableCell className="font-medium">{plan.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {plan.company || "N/A"}
                    </TableCell>
                    <TableCell>{formatCurrency(plan.monthly_charge)}</TableCell>
                    <TableCell>
                      <Badge className={getStatusVariant(plan.is_active)}>
                        {plan.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <PlanForm plan={plan}>
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </PlanForm>
                        <DeletePlanDialog planId={plan.id} planName={plan.name}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </DeletePlanDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* MOBILE VIEW */}
          <div className="block md:hidden space-y-4">
            {plans.map((plan: Plan) => (
              <Card key={plan.id} className="w-full">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    <Badge className={getStatusVariant(plan.is_active)}>
                      {plan.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <CardDescription>
                    Provider: {plan.company || "N/A"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Monthly Charge:
                    </span>
                    <span className="font-medium">
                      {formatCurrency(plan.monthly_charge)}
                    </span>
                  </div>
                </CardContent>
                <CardFooter>
                  <div className="flex flex-col sm:flex-row w-full gap-2">
                    <PlanForm plan={plan}>
                      <Button variant="outline" className="w-full">
                        Edit
                      </Button>
                    </PlanForm>
                    <DeletePlanDialog planId={plan.id} planName={plan.name}>
                      <Button
                        variant="outline"
                        className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-400">
                        Delete
                      </Button>
                    </DeletePlanDialog>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
