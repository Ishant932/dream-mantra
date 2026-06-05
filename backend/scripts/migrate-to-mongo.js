/**
 * One-time migration: data.json → MongoDB Atlas
 *
 * Usage:
 *   $env:MONGODB_URI = "mongodb+srv://..."
 *   node backend/scripts/migrate-to-mongo.js
 */
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectMongo, disconnectMongo, isMongoConfigured } from '../lib/mongo.js';
import AppState from '../models/AppState.js';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

async function main() {
  if (!isMongoConfigured()) {
    console.error('\nSet MONGODB_URI in backend/.env or environment.\n');
    process.exit(1);
  }

  const dbPath = path.join(__dirname, '../data.json');
  if (!fs.existsSync(dbPath)) {
    console.error('No data.json found — nothing to migrate.');
    process.exit(1);
  }

  const payload = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  await connectMongo();
  await AppState.findByIdAndUpdate(
    'main',
    { payload, updatedAt: new Date() },
    { upsert: true, new: true }
  );

  const users = payload.users?.length || 0;
  const payments = payload.payments?.length || 0;
  console.log(`\nMigrated to MongoDB Atlas:`);
  console.log(`  users: ${users}`);
  console.log(`  payments: ${payments}`);
  console.log(`  assessments: ${payload.assessments?.length || 0}`);
  console.log('\nRestart the server with MONGODB_URI set.\n');

  await disconnectMongo();
}

main().catch((err) => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});
