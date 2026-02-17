#!/bin/bash

# Migrate database schema to Supabase cloud
# This script pushes migrations and generates TypeScript types

set -e

echo "🚀 Booking System Supabase Migration Script"
echo "=========================================="

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Install it with:"
    echo "   brew install supabase/tap/supabase"
    exit 1
fi

echo "✅ Supabase CLI found: $(supabase --version)"

# Navigate to project directory
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"

echo ""
echo "📁 Working directory: $PROJECT_DIR"

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ .env.local file not found!"
    echo "Please create .env.local with your Supabase credentials:"
    echo "   NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co"
    echo "   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ..."
    echo "   SUPABASE_SERVICE_ROLE_KEY=eyJ..."
    exit 1
fi

echo "✅ .env.local file found"

# Extract Supabase project ID from URL
SUPABASE_URL=$(grep "NEXT_PUBLIC_SUPABASE_URL" .env.local | cut -d'=' -f2 | tr -d ' ')
if [[ $SUPABASE_URL == *"supabase.co"* ]]; then
    PROJECT_ID=$(echo $SUPABASE_URL | sed 's|https://||g' | sed 's|\.supabase\.co||g')
    echo "✅ Detected Supabase project: $PROJECT_ID"
else
    echo "❌ Invalid SUPABASE_URL in .env.local"
    exit 1
fi

echo ""
echo "🔗 Linking to Supabase project..."

# Link to the project (or re-link if already linked)
if supabase link --project-ref "$PROJECT_ID" 2>&1; then
    echo "✅ Successfully linked to project: $PROJECT_ID"
else
    echo "⚠️  Could not auto-link. You may need to authenticate manually:"
    echo "   supabase link --project-ref $PROJECT_ID"
    echo ""
    read -p "Continue? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo ""
echo "📤 Pushing migrations to Supabase..."

# Push migrations
if supabase db push; then
    echo "✅ Migrations pushed successfully!"
else
    echo "❌ Failed to push migrations"
    echo "Troubleshooting:"
    echo "  - Verify your Supabase credentials in .env.local"
    echo "  - Ensure your project is active on supabase.com"
    echo "  - Check internet connectivity"
    exit 1
fi

echo ""
echo "🔤 Generating TypeScript types..."

# Generate types
if supabase gen types typescript --project-ref "$PROJECT_ID" --output-dir lib/types/database.types.ts; then
    echo "✅ Types generated at: lib/types/database.types.ts"
else
    echo "⚠️  Could not generate types from remote database"
    echo "Generating from local schema instead..."
    if supabase gen types typescript --local > lib/types/database.types.ts; then
        echo "✅ Types generated from local schema"
    else
        echo "❌ Failed to generate types"
        exit 1
    fi
fi

echo ""
echo "✅ Migration complete!"
echo ""
echo "Next steps:"
echo "1. Review the generated types in lib/types/database.types.ts"
echo "2. Test API endpoints: npm run dev"
echo "3. Verify database tables at: $SUPABASE_URL"
echo ""
