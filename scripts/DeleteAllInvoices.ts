import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Attempting to delete all invoices...");

  // The empty {} in deleteMany means "delete all records"
  const { count } = await prisma.invoice.deleteMany({});

  console.log(`✅ Successfully deleted ${count} invoices.`);
}

main()
  .catch((e) => {
    console.error("An error occurred while deleting invoices:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
