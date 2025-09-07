import prisma from '@/lib/prisma';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PlanForm } from './PlanForm';
import { DeletePlanDialog } from './DeletePlanDialog'; // ✅ Import the new component
import { Edit, Trash2 } from 'lucide-react'; // ✅ Import the Trash2 icon
import { Plan } from '@prisma/client';

// ... getStatusVariant function remains the same ...
const getStatusVariant = (isActive: boolean) => {
  return isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
};

export default async function PlansPage() {
  const plans = await prisma.plan.findMany({
    orderBy: { name: 'asc' },
  });

  return (
    <div className="flex flex-col gap-4">
      {/* ... header remains the same ... */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>All Plans</CardTitle>
            <CardDescription>A list of all available service plans.</CardDescription>
          </div>
          <PlanForm>
            <Button className='bg-blue-500 hover:bg-blue-600 text-white'>Add New Plan</Button>
          </PlanForm>
        </CardHeader>
        <CardContent>
          {/* DESKTOP VIEW */}
          <div className="hidden md:block">
            <Table>
              {/* ... TableHeader remains the same ... */}
              <TableBody>
                {plans.map((plan: Plan) => (
                  <TableRow key={plan.id}>
                    <TableCell className="font-medium">{plan.name}</TableCell>
                    <TableCell>PKR {plan.monthly_charge.toLocaleString()}</TableCell>
                    <TableCell>{plan.tax_rate}%</TableCell>
                    <TableCell><Badge className={getStatusVariant(plan.is_active)}>{plan.is_active ? 'Active' : 'Inactive'}</Badge></TableCell>
                    <TableCell className="text-right">
                       {/* ✅ Group action buttons together */}
                       <div className="flex items-center justify-end gap-2">
                         <PlanForm plan={plan}>
                           <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                         </PlanForm>
                         <DeletePlanDialog planId={plan.id} planName={plan.name}>
                           <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700">
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
                {/* ... CardHeader and CardContent remain the same ... */}
                <CardFooter>
                  {/* ✅ Group action buttons together */}
                  <div className="flex w-full gap-2">
                    <PlanForm plan={plan}>
                      <Button variant="outline" className="w-full">Edit</Button>
                    </PlanForm>
                    <DeletePlanDialog planId={plan.id} planName={plan.name}>
                      <Button variant="outline" className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-400">
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