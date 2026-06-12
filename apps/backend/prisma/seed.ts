import { PrismaClient } from '../generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Starting seed...');

  // Clean existing data
  await prisma.reservation.deleteMany();
  await prisma.establishment.deleteMany();

  // Create a default establishment
  const establishment = await prisma.establishment.create({
    data: {
      id: 'savour-bistro-id', // Fixed ID for easy testing
      name: 'Savour Bistro',
      capacity: 50, // 50 seats
      turnoverTime: 120, // 2 hours (120 minutes)
    },
  });
  console.log(`Created establishment: ${establishment.name}`);

  // Create relative dates for today (e.g. today at 15:00, 18:00, 20:00 UTC)
  const today = new Date();
  today.setHours(19, 0, 0, 0); // 19:00 local time

  const date18 = new Date(today);
  date18.setHours(18, 0, 0, 0); // 18:00 (overlaps with 19:00 check)

  const date20 = new Date(today);
  date20.setHours(20, 0, 0, 0); // 20:00 (overlaps with 19:00 check)

  const date15 = new Date(today);
  date15.setHours(15, 0, 0, 0); // 15:00 (does not overlap with 19:00 check)

  // Seed overlapping reservations
  // Sum of overlapping at 19:00 = 10 (at 18:00) + 15 (at 20:00) = 25 seats reserved
  await prisma.reservation.createMany({
    data: [
      {
        establishmentId: establishment.id,
        date: date18,
        guests: 10,
        name: 'Maria Souza',
        contact: '+55 11 99999-1111',
        status: 'CONFIRMED',
      },
      {
        establishmentId: establishment.id,
        date: date20,
        guests: 15,
        name: 'João Silva',
        contact: '+55 11 99999-2222',
        status: 'CONFIRMED',
      },
      {
        establishmentId: establishment.id,
        date: date15,
        guests: 8,
        name: 'Ana Costa',
        contact: '+55 11 99999-3333',
        status: 'CONFIRMED',
      },
    ],
  });

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
