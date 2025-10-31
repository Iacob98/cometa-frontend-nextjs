#!/bin/bash

# Script to audit all Dialog/Modal components for responsive design issues
# Checks for common responsive design problems in modals

echo "🔍 RESPONSIVE MODAL AUDIT"
echo "========================="
echo ""

# Find all Dialog/Modal components
echo "📋 Finding all Dialog/Modal usage..."
DIALOG_FILES=$(grep -rl "DialogContent\|Modal" src/components --include="*.tsx" | sort)

echo "Found $(echo "$DIALOG_FILES" | wc -l) files with Dialog/Modal components"
echo ""

# Check each file for common responsive issues
echo "🔍 Checking for responsive design issues..."
echo ""

for file in $DIALOG_FILES; do
    echo "---"
    echo "📄 File: $file"

    # Check 1: Fixed width classes (max-w-*)
    fixed_width=$(grep -n "max-w-\[0-9\]" "$file" | head -3)
    if [ -n "$fixed_width" ]; then
        echo "  ⚠️  Fixed width detected:"
        echo "$fixed_width" | sed 's/^/     /'
    fi

    # Check 2: Missing responsive classes (no sm: md: lg:)
    has_responsive=$(grep -c "sm:\|md:\|lg:" "$file" || echo "0")
    if [ "$has_responsive" -eq 0 ]; then
        echo "  ❌ No responsive classes found (sm:, md:, lg:)"
    fi

    # Check 3: Missing max-h or overflow handling
    has_overflow=$(grep -c "max-h-\|overflow-" "$file" || echo "0")
    if [ "$has_overflow" -eq 0 ]; then
        echo "  ⚠️  No overflow/max-height handling"
    fi

    # Check 4: Missing scrollable content
    has_scroll=$(grep -c "overflow-y-auto\|overflow-auto" "$file" || echo "0")
    if [ "$has_scroll" -eq 0 ]; then
        echo "  ⚠️  No scrollable content area"
    fi

    echo ""
done

echo ""
echo "📊 SUMMARY"
echo "=========="
echo "Total files checked: $(echo "$DIALOG_FILES" | wc -l)"
echo ""
echo "✅ RECOMMENDATIONS:"
echo "1. Use responsive width: max-w-full sm:max-w-md md:max-w-lg lg:max-w-xl"
echo "2. Add max-height: max-h-[80vh] or max-h-[90vh]"
echo "3. Make content scrollable: overflow-y-auto"
echo "4. Use responsive padding: p-4 sm:p-6"
echo "5. Stack elements on mobile: flex-col sm:flex-row"
echo ""
