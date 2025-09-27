#!/bin/bash

# Comprehensive API Migration Audit Script
# Checks every API endpoint for migration status

echo "🔍 COMETA API Migration Status Audit"
echo "===================================="

# Find all API files
API_FILES=$(find src/app/api -name "*.ts" -type f | sort)
TOTAL_FILES=$(echo "$API_FILES" | wc -l)

echo "📊 Total API files: $TOTAL_FILES"
echo ""

# Categories
SUPABASE_ONLY=0
DOCKER_LEGACY=0
GATEWAY_LEGACY=0
HYBRID=0
UNKNOWN=0

# Arrays for detailed reporting
declare -a SUPABASE_FILES
declare -a DOCKER_FILES
declare -a GATEWAY_FILES
declare -a HYBRID_FILES
declare -a UNKNOWN_FILES

echo "📋 Migration Status by File:"
echo "----------------------------"

for file in $API_FILES; do
    HAS_SUPABASE=$(grep -c "@supabase/supabase-js" "$file" 2>/dev/null || echo 0)
    HAS_DOCKER=$(grep -c "docker exec" "$file" 2>/dev/null || echo 0)
    HAS_GATEWAY=$(grep -c "GATEWAY_URL" "$file" 2>/dev/null || echo 0)

    # Determine status
    if [[ $HAS_SUPABASE -gt 0 && $HAS_DOCKER -eq 0 && $HAS_GATEWAY -eq 0 ]]; then
        echo "✅ $file - SUPABASE ONLY"
        ((SUPABASE_ONLY++))
        SUPABASE_FILES+=("$file")
    elif [[ $HAS_DOCKER -gt 0 && $HAS_SUPABASE -eq 0 ]]; then
        echo "❌ $file - DOCKER LEGACY"
        ((DOCKER_LEGACY++))
        DOCKER_FILES+=("$file")
    elif [[ $HAS_GATEWAY -gt 0 && $HAS_SUPABASE -eq 0 ]]; then
        echo "⚠️  $file - GATEWAY LEGACY"
        ((GATEWAY_LEGACY++))
        GATEWAY_FILES+=("$file")
    elif [[ $HAS_SUPABASE -gt 0 && ($HAS_DOCKER -gt 0 || $HAS_GATEWAY -gt 0) ]]; then
        echo "🔄 $file - HYBRID (needs cleanup)"
        ((HYBRID++))
        HYBRID_FILES+=("$file")
    else
        echo "❓ $file - UNKNOWN/BASIC"
        ((UNKNOWN++))
        UNKNOWN_FILES+=("$file")
    fi
done

echo ""
echo "📈 Migration Statistics:"
echo "----------------------"
echo "✅ Pure Supabase: $SUPABASE_ONLY files"
echo "❌ Docker Legacy: $DOCKER_LEGACY files"
echo "⚠️  Gateway Legacy: $GATEWAY_LEGACY files"
echo "🔄 Hybrid (needs cleanup): $HYBRID files"
echo "❓ Unknown/Basic: $UNKNOWN files"
echo ""

# Calculate completion percentage
MIGRATED=$((SUPABASE_ONLY + GATEWAY_LEGACY))
COMPLETION_PCT=$(( (MIGRATED * 100) / TOTAL_FILES ))

echo "🎯 Migration Progress:"
echo "--------------------"
echo "Fully Migrated: $MIGRATED / $TOTAL_FILES ($COMPLETION_PCT%)"
echo "Remaining Work: $((DOCKER_LEGACY + HYBRID)) files need attention"
echo ""

# Priority files that need immediate attention
if [[ $DOCKER_LEGACY -gt 0 || $HYBRID -gt 0 ]]; then
    echo "🚨 Priority Files Needing Migration:"
    echo "-----------------------------------"

    for file in "${DOCKER_FILES[@]}"; do
        echo "❌ $file - Still using Docker PostgreSQL commands"
    done

    for file in "${HYBRID_FILES[@]}"; do
        echo "🔄 $file - Mixed implementation needs cleanup"
    done
    echo ""
fi

echo "💡 Recommendations:"
echo "------------------"
if [[ $COMPLETION_PCT -ge 80 ]]; then
    echo "✅ Migration is mostly complete ($COMPLETION_PCT%)"
    echo "   Focus on cleaning up remaining $((DOCKER_LEGACY + HYBRID)) files"
elif [[ $COMPLETION_PCT -ge 60 ]]; then
    echo "⚠️  Migration is in progress ($COMPLETION_PCT%)"
    echo "   Continue systematic migration of remaining files"
else
    echo "❌ Migration needs significant work ($COMPLETION_PCT%)"
    echo "   Consider bulk migration approach"
fi

echo ""
echo "🏁 Audit Complete!"