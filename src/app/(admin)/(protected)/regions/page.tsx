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
import { RegionForm } from "./RegionForm";
import { DeleteRegionDialog } from "./DeleteRegionDialog";
import { Edit, Trash2 } from "lucide-react";
import { Region } from "@prisma/client";

type RegionWithDetails = Region & {
  parent: Region | null;
  _count: {
    children: number;
    customers: number;
  };
};

export default async function RegionsPage() {
  const regions: RegionWithDetails[] = await prisma.region.findMany({
    include: {
      parent: true,
      _count: {
        select: { children: true, customers: true },
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="flex flex-col gap-4">
      <header>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Regions
        </h1>
        <p className="text-muted-foreground">
          Manage service areas and sub-regions.
        </p>
      </header>
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>All Regions</CardTitle>
            <CardDescription>
              A list of all defined service areas.
            </CardDescription>
          </div>
          <RegionForm allRegions={regions}>
            <Button className="bg-blue-500 hover:bg-blue-600 text-white">Add New Region</Button>
          </RegionForm>
        </CardHeader>
        <CardContent>
          {/* DESKTOP VIEW */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Region Name</TableHead>
                  <TableHead>Parent Region</TableHead>
                  <TableHead>Sub-regions</TableHead>
                  <TableHead>Customers</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {regions.map((region) => (
                  <TableRow key={region.id}>
                    <TableCell className="font-medium">{region.name}</TableCell>
                    <TableCell>{region.parent?.name || "—"}</TableCell>
                    <TableCell>{region._count.children}</TableCell>
                    <TableCell>{region._count.customers}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <RegionForm region={region} allRegions={regions}>
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </RegionForm>
                        <DeleteRegionDialog
                          regionId={region.id}
                          regionName={region.name}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </DeleteRegionDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* MOBILE VIEW */}
          <div className="block md:hidden space-y-4">
            {regions.map((region) => (
              <Card key={region.id} className="w-full">
                <CardHeader>
                  <CardTitle className="text-lg">{region.name}</CardTitle>
                  <CardDescription>
                    Parent: {region.parent?.name || "None"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sub-regions:</span>
                    <span className="font-medium">
                      {region._count.children}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Customers:</span>
                    <span className="font-medium">
                      {region._count.customers}
                    </span>
                  </div>
                </CardContent>
                <CardFooter>
                  <div className="flex w-full gap-2">
                    <RegionForm region={region} allRegions={regions}>
                      <Button variant="outline" className="w-full">
                        Edit
                      </Button>
                    </RegionForm>
                    <DeleteRegionDialog
                      regionId={region.id}
                      regionName={region.name}
                    >
                      <Button
                        variant="outline"
                        className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-400"
                      >
                        Delete
                      </Button>
                    </DeleteRegionDialog>
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
