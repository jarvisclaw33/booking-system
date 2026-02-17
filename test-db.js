#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
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

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const client = createClient(supabaseUrl, serviceRoleKey);

async function testDatabase() {
  try {
    console.log('Testing database connection...');
    
    const { data, error, count } = await client
      .from('organizations')
      .select('*', { count: 'exact', head: true });

    if (error) {
      if (error.code === 'PGRST116') {
        console.log('\n❌ DATABASE SCHEMA NOT INITIALIZED');
        console.log('\nTo set up the schema, please:');
        console.log('1. Go to https://app.supabase.com/projects');
        console.log('2. Select your project: lqtjsgevtnvlrwwkkmgk');
        console.log('3. Click "SQL Editor" → "New Query"');
        console.log('4. Copy & paste the entire SQL from: supabase/migrations/20250213000000_init_schema.sql');
        console.log('5. Click "Execute"');
        console.log('6. Run this test again');
        process.exit(1);
      }
      throw error;
    }

    console.log('✅ Database connection successful');
    console.log(`✅ Organizations table exists (${count} records)`);
    
    // Try to fetch other tables
    const tables = ['locations', 'offerings', 'resources', 'bookings'];
    for (const table of tables) {
      const { error: e } = await client
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (e) {
        console.log(`⚠️  ${table}: Table not found`);
      } else {
        console.log(`✅ ${table}: OK`);
      }
    }

    return true;
  } catch (error) {
    console.error('❌ Database error:', error.message);
    process.exit(1);
  }
}

testDatabase();
