const { PrismaClient } = require("@prisma/client");
const XLSX = require("xlsx");

const prisma = new PrismaClient();

async function main() {
  const workbook = XLSX.readFile("customers.xlsx");
  const sheetName = workbook.SheetNames[0];
  const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

  console.log(`📊 Found ${data.length} customers in Excel file.`);

  for (const row of data) {
    try {
      const { username, Fname, phone, address, status, region_id, plan_id } =
        row;

      await prisma.customer.create({
        data: {
          username: username?.toString(),
          Fname: Fname?.toString() || "Unknown",
          phone: phone?.toString(),
          address: address?.toString(),
          status: status?.toUpperCase() || "ACTIVE",
          createdAt: new Date(),
          region: { connect: { id: region_id.toString() } },
          plan: { connect: { id: plan_id.toString() } },
        },
      });

      console.log(`✅ Inserted: ${username}`);
    } catch (error) {
      console.error(`❌ Error inserting ${row.username}:`, error.message);
    }
  }

  console.log("🎉 Import completed successfully.");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
