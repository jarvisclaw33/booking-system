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

const client = createClient(supabaseUrl, serviceRoleKey);

async function testAPI() {
  try {
    console.log('🧪 Testing Booking System API\n');
    
    // Step 1: Create a test organization
    console.log('1️⃣  Creating test organization...');
    const { data: orgData, error: orgError } = await client
      .from('organizations')
      .insert({
        name: 'Test Restaurant',
        slug: `test-restaurant-${Date.now()}`,
        settings: {},
      })
      .select();

    if (orgError) {
      throw new Error(`Failed to create organization: ${orgError.message}`);
    }

    const orgId = orgData[0].id;
    console.log(`✅ Organization created: ${orgId}`);

    // Step 2: Create test locations
    console.log('\n2️⃣  Creating test locations...');
    const { data: locData, error: locError } = await client
      .from('locations')
      .insert([
        {
          organization_id: orgId,
          name: 'Main Branch',
          address: '123 Main St',
          timezone: 'Europe/Berlin',
          settings: {},
        },
        {
          organization_id: orgId,
          name: 'Downtown Branch',
          address: '456 Downtown Ave',
          timezone: 'Europe/Berlin',
          settings: {},
        },
      ])
      .select();

    if (locError) {
      throw new Error(`Failed to create locations: ${locError.message}`);
    }

    console.log(`✅ Created ${locData.length} locations`);
    locData.forEach((loc, i) => {
      console.log(`  ${i + 1}. ${loc.name} (${loc.id})`);
    });

    // Step 3: Create test offerings
    console.log('\n3️⃣  Creating test offerings...');
    const { data: offData, error: offError } = await client
      .from('offerings')
      .insert([
        {
          organization_id: orgId,
          location_id: locData[0].id,
          name: 'Standard Dinner',
          description: 'A full 3-course dinner experience',
          duration_minutes: 120,
          capacity: 2,
          price_cents: 5000,
          is_active: true,
        },
        {
          organization_id: orgId,
          location_id: locData[0].id,
          name: 'Premium Dinner',
          description: 'Our finest 5-course tasting menu',
          duration_minutes: 180,
          capacity: 2,
          price_cents: 10000,
          is_active: true,
        },
      ])
      .select();

    if (offError) {
      throw new Error(`Failed to create offerings: ${offError.message}`);
    }

    console.log(`✅ Created ${offData.length} offerings`);

    // Step 4: Create test resources
    console.log('\n4️⃣  Creating test resources...');
    const { data: resData, error: resError } = await client
      .from('resources')
      .insert([
        {
          organization_id: orgId,
          location_id: locData[0].id,
          name: 'Table 1',
          type: 'table',
          capacity: 2,
          is_active: true,
        },
        {
          organization_id: orgId,
          location_id: locData[0].id,
          name: 'Table 2',
          type: 'table',
          capacity: 4,
          is_active: true,
        },
        {
          organization_id: orgId,
          location_id: locData[0].id,
          name: 'Chef Maria',
          type: 'staff',
          capacity: 1,
          is_active: true,
        },
      ])
      .select();

    if (resError) {
      throw new Error(`Failed to create resources: ${resError.message}`);
    }

    console.log(`✅ Created ${resData.length} resources`);

    // Step 5: Test retrieving data
    console.log('\n5️⃣  Verifying data retrieval...');
    
    const { data: verifyLoc, error: verifyLocErr } = await client
      .from('locations')
      .select('*')
      .eq('organization_id', orgId);

    if (verifyLocErr) {
      throw verifyLocErr;
    }

    const { data: verifyOff, error: verifyOffErr } = await client
      .from('offerings')
      .select('*')
      .eq('organization_id', orgId);

    if (verifyOffErr) {
      throw verifyOffErr;
    }

    const { data: verifyRes, error: verifyResErr } = await client
      .from('resources')
      .select('*')
      .eq('organization_id', orgId);

    if (verifyResErr) {
      throw verifyResErr;
    }

    console.log(`✅ Retrieved ${verifyLoc.length} locations`);
    console.log(`✅ Retrieved ${verifyOff.length} offerings`);
    console.log(`✅ Retrieved ${verifyRes.length} resources`);

    // Step 6: Create a test booking
    console.log('\n6️⃣  Creating test booking...');
    const bookingStart = new Date();
    bookingStart.setHours(bookingStart.getHours() + 2);
    const bookingEnd = new Date(bookingStart);
    bookingEnd.setHours(bookingEnd.getHours() + 2);

    const { data: bookData, error: bookError } = await client
      .from('bookings')
      .insert({
        organization_id: orgId,
        location_id: locData[0].id,
        offering_id: offData[0].id,
        resource_id: resData[0].id,
        customer_name: 'John Doe',
        customer_email: 'john@example.com',
        customer_phone: '+49301234567',
        start_time: bookingStart.toISOString(),
        end_time: bookingEnd.toISOString(),
        status: 'confirmed',
        notes: 'Test booking',
      })
      .select();

    if (bookError) {
      throw new Error(`Failed to create booking: ${bookError.message}`);
    }

    console.log(`✅ Booking created: ${bookData[0].id}`);

    // Summary
    console.log('\n\n📊 TEST SUMMARY\n' + '='.repeat(50));
    console.log(`✅ Database schema is working`);
    console.log(`✅ All tables are accessible`);
    console.log(`✅ Can create and retrieve records`);
    console.log(`\nTest Organization: ${orgId}`);
    console.log(`Locations: ${verifyLoc.length}`);
    console.log(`Offerings: ${verifyOff.length}`);
    console.log(`Resources: ${verifyRes.length}`);
    console.log(`Bookings: 1`);
    console.log('\n✅ ALL TESTS PASSED!\n');

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    process.exit(1);
  }
}

testAPI();
