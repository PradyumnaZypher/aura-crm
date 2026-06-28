import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // --- Seed Leads ---
  const leadsPath = path.join(__dirname, 'seed-data', 'leads.json');
  const leadsData = JSON.parse(fs.readFileSync(leadsPath, 'utf-8'));
  for (const lead of leadsData) {
    await prisma.lead.upsert({
      where: { email: lead.email },
      update: {},
      create: lead,
    });
  }
  console.log(`${leadsData.length} leads have been seeded.`);

  // --- Seed Clients ---
  const clientsPath = path.join(__dirname, 'seed-data', 'clients.json');
  const clientsData = JSON.parse(fs.readFileSync(clientsPath, 'utf-8'));
  for (const client of clientsData) {
    await prisma.client.upsert({
        where: { contactEmail: client.contactEmail },
        update: {},
        create: client,
    });
  }
  console.log(`${clientsData.length} clients have been seeded.`);

  // --- Seed Products ---
    const productsPath = path.join(__dirname, 'seed-data', 'products.json');
    const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));
    for (const product of productsData) {
        await prisma.product.upsert({
            where: { name: product.name },
            update: {},
            create: product,
        });
    }
    console.log(`${productsData.length} products have been seeded.`);

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
