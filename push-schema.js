#!/usr/bin/env node

const { Client } = require('pg');
const fs = require('fs');

// Load .env file
const envContent = fs.readFileSync('.env', 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length) {
    env[key.trim()] = valueParts.join('=').trim();
  }
});

const databaseUrl = env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ Missing DATABASE_URL in .env');
  process.exit(1);
}

const client = new Client({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false }, // Required for Supabase
});

async function pushSchema() {
  try {
    console.log('📤 Connecting to Supabase database...');
    await client.connect();
    console.log('✅ Connected\n');

    // Read the migration file
    const migrationPath = './supabase/migrations/20250213000000_init_schema.sql';
    const schema = fs.readFileSync(migrationPath, 'utf-8');

    console.log('📤 Executing schema...');
    await client.query(schema);
    console.log('✅ Schema executed successfully\n');

    // Verify tables exist
    console.log('🔍 Verifying tables...');
    const tables = [
      'organizations',
      'user_organizations',
      'locations',
      'offerings',
      'resources',
      'schedules',
      'blocks',
      'bookings',
      'audit_logs',
      'notification_log',
    ];

    for (const table of tables) {
      const result = await client.query(
        `SELECT COUNT(*) FROM information_schema.tables WHERE table_name = $1 AND table_schema = 'public'`,
        [table]
      );
      const exists = parseInt(result.rows[0].count) > 0;
      console.log(exists ? `✅ ${table}` : `❌ ${table}`);
    }

    console.log('\n✅ Schema setup complete!\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('already exists')) {
      console.log('✅ Tables already exist (idempotent)');
    } else {
      process.exit(1);
    }
  } finally {
    await client.end();
  }
}

pushSchema();
