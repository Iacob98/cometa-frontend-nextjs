#!/bin/bash

# Bulk migration script from Docker PostgreSQL to Supabase
# This script identifies and transforms API endpoints using docker exec commands

echo "🔧 Starting bulk migration of Docker PostgreSQL endpoints to Supabase..."

# Find all files using docker exec
DOCKER_FILES=$(grep -r "docker exec.*postgres" src/app/api --include="*.ts" -l)

echo "📊 Found $(echo "$DOCKER_FILES" | wc -l) files using Docker PostgreSQL connections"

# Create backup directory
mkdir -p .migration-backup/$(date +%Y%m%d_%H%M%S)
BACKUP_DIR=".migration-backup/$(date +%Y%m%d_%H%M%S)"

echo "📁 Creating backups in $BACKUP_DIR"

# Counter for successful migrations
MIGRATED=0
FAILED=0

for file in $DOCKER_FILES; do
    if [[ -f "$file" ]]; then
        echo "🔄 Processing: $file"

        # Create backup
        cp "$file" "$BACKUP_DIR/$(basename "$file").bak"

        # Check if file already has Supabase imports
        if grep -q "@supabase/supabase-js" "$file"; then
            echo "   ⚠️  Already has Supabase imports - skipping"
            continue
        fi

        # Create temporary file for transformation
        TEMP_FILE=$(mktemp)

        # Perform basic transformations
        cat "$file" | \
        # Replace imports
        sed 's|import { exec } from.*child_process.*|import { createClient } from '\''@supabase/supabase-js'\'';|' | \
        sed 's|import { promisify } from.*util.*||' | \
        sed '/const execAsync = promisify(exec);/d' | \
        # Add Supabase client initialization after imports
        sed '/from '\''@supabase\/supabase-js'\'';/a\\nconst supabase = createClient(\n  process.env.NEXT_PUBLIC_SUPABASE_URL!,\n  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!\n);' | \
        # Add comment about manual migration needed
        sed '/export async function/i // ⚠️  MIGRATION NEEDED: This endpoint requires manual conversion from Docker PostgreSQL to Supabase queries' \
        > "$TEMP_FILE"

        # Replace original file
        mv "$TEMP_FILE" "$file"

        echo "   ✅ Basic transformation applied"
        ((MIGRATED++))
    else
        echo "   ❌ File not found: $file"
        ((FAILED++))
    fi
done

echo ""
echo "🎯 Migration Summary:"
echo "   ✅ Files processed: $MIGRATED"
echo "   ❌ Files failed: $FAILED"
echo "   📁 Backups saved to: $BACKUP_DIR"
echo ""
echo "⚠️  IMPORTANT: Files have been prepared but require manual Supabase query conversion!"
echo "   - Replace 'docker exec' commands with supabase.from().select() queries"
echo "   - Update error handling for Supabase responses"
echo "   - Test each endpoint individually"
echo ""
echo "🚀 Priority endpoints to manually migrate:"
echo "   1. /api/projects/[id]/team/route.ts"
echo "   2. /api/projects/[id]/documents/route.ts"
echo "   3. /api/project-preparation/route.ts"
echo "   4. /api/notifications/route.ts"
echo ""