#!/bin/bash

# Comprehensive Post-Migration API Audit Script
# Performs deep analysis of all API endpoints after FastAPI -> Supabase migration

echo "🔍 COMPREHENSIVE POST-MIGRATION API AUDIT"
echo "=========================================="
echo

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
TOTAL_FILES=0
WORKING_FILES=0
ERROR_FILES=0
MISSING_FILES=0
EMPTY_FILES=0

# Arrays for categorization
declare -a WORKING_ENDPOINTS
declare -a ERROR_ENDPOINTS
declare -a MISSING_ENDPOINTS
declare -a EMPTY_ENDPOINTS

# Function to test API endpoint
test_endpoint() {
    local path="$1"
    local method="${2:-GET}"
    local url="http://localhost:3000${path}"

    # Test the endpoint with timeout
    response=$(curl -s -w "%{http_code}" -X "$method" "$url" --max-time 5 --connect-timeout 2 2>/dev/null)
    http_code="${response: -3}"

    case "$http_code" in
        200|201) return 0 ;;  # Success
        404) return 1 ;;      # Not found
        405) return 2 ;;      # Method not allowed
        500) return 3 ;;      # Server error
        *) return 4 ;;        # Other/timeout
    esac
}

# Function to analyze file
analyze_file() {
    local file="$1"
    local relative_path="${file#src/app/}"

    echo -n "Analyzing: $relative_path ... "

    # Check if file is empty
    if [[ ! -s "$file" ]]; then
        echo -e "${RED}EMPTY${NC}"
        EMPTY_ENDPOINTS+=("$relative_path")
        ((EMPTY_FILES++))
        return
    fi

    # Extract API path from file structure
    local api_path=$(echo "$relative_path" | sed 's|api/||' | sed 's|/route\.ts||' | sed 's|\[id\]|test-id|g')
    api_path="/api/$api_path"

    # Test different HTTP methods
    test_endpoint "$api_path" "GET"
    get_result=$?

    test_endpoint "$api_path" "POST"
    post_result=$?

    # Analyze results
    if [[ $get_result -eq 0 ]] || [[ $post_result -eq 0 ]]; then
        echo -e "${GREEN}WORKING${NC}"
        WORKING_ENDPOINTS+=("$relative_path")
        ((WORKING_FILES++))
    elif [[ $get_result -eq 2 ]] || [[ $post_result -eq 2 ]]; then
        echo -e "${YELLOW}405 ERROR${NC}"
        ERROR_ENDPOINTS+=("$relative_path - Methods not properly implemented")
        ((ERROR_FILES++))
    elif [[ $get_result -eq 3 ]] || [[ $post_result -eq 3 ]]; then
        echo -e "${RED}SERVER ERROR${NC}"
        ERROR_ENDPOINTS+=("$relative_path - Runtime errors")
        ((ERROR_FILES++))
    else
        echo -e "${RED}NOT RESPONDING${NC}"
        ERROR_ENDPOINTS+=("$relative_path - Endpoint not responding")
        ((ERROR_FILES++))
    fi
}

# Find all API route files
echo "📂 Scanning API directory structure..."
API_FILES=$(find src/app/api -name "route.ts" -type f | sort)
TOTAL_FILES=$(echo "$API_FILES" | wc -l | tr -d ' ')

echo "Found $TOTAL_FILES API endpoint files"
echo

# Analyze each file
echo "🔬 Testing each endpoint..."
echo "----------------------------"

for file in $API_FILES; do
    analyze_file "$file"
    ((TOTAL_FILES++))
done

echo
echo "📊 AUDIT RESULTS SUMMARY"
echo "========================"
echo -e "Total API files: ${BLUE}$TOTAL_FILES${NC}"
echo -e "Working endpoints: ${GREEN}$WORKING_FILES${NC}"
echo -e "Error endpoints: ${RED}$ERROR_FILES${NC}"
echo -e "Empty files: ${YELLOW}$EMPTY_FILES${NC}"
echo

# Calculate success rate
if [[ $TOTAL_FILES -gt 0 ]]; then
    SUCCESS_RATE=$(( (WORKING_FILES * 100) / TOTAL_FILES ))
    echo -e "Success Rate: ${BLUE}$SUCCESS_RATE%${NC}"
else
    echo "Success Rate: N/A"
fi

echo

# Show working endpoints
if [[ ${#WORKING_ENDPOINTS[@]} -gt 0 ]]; then
    echo -e "${GREEN}✅ WORKING ENDPOINTS (${#WORKING_ENDPOINTS[@]})${NC}"
    echo "----------------------------"
    for endpoint in "${WORKING_ENDPOINTS[@]}"; do
        echo -e "  ${GREEN}✓${NC} $endpoint"
    done
    echo
fi

# Show error endpoints
if [[ ${#ERROR_ENDPOINTS[@]} -gt 0 ]]; then
    echo -e "${RED}❌ ERROR ENDPOINTS (${#ERROR_ENDPOINTS[@]})${NC}"
    echo "----------------------------"
    for endpoint in "${ERROR_ENDPOINTS[@]}"; do
        echo -e "  ${RED}✗${NC} $endpoint"
    done
    echo
fi

# Show empty files
if [[ ${#EMPTY_ENDPOINTS[@]} -gt 0 ]]; then
    echo -e "${YELLOW}📝 EMPTY FILES (${#EMPTY_ENDPOINTS[@]})${NC}"
    echo "----------------------------"
    for endpoint in "${EMPTY_ENDPOINTS[@]}"; do
        echo -e "  ${YELLOW}○${NC} $endpoint"
    done
    echo
fi

# Priority endpoints that need attention
echo "🚨 PRIORITY FIXES NEEDED"
echo "========================"

# Check for critical missing endpoints from browser errors
critical_missing=(
    "/api/materials/allocations"
    "/api/materials/low-stock"
    "/api/materials/orders"
    "/api/vehicles"
    "/api/equipment/analytics"
    "/api/financial/summary"
    "/api/transactions"
    "/api/crews"
)

echo "Critical missing endpoints:"
for endpoint in "${critical_missing[@]}"; do
    if [[ -f "src/app${endpoint}/route.ts" ]]; then
        if [[ ! -s "src/app${endpoint}/route.ts" ]]; then
            echo -e "  ${YELLOW}○${NC} $endpoint - File exists but empty"
        fi
    else
        echo -e "  ${RED}✗${NC} $endpoint - File missing completely"
    fi
done

echo
echo "💡 RECOMMENDATIONS"
echo "==================="

if [[ $SUCCESS_RATE -lt 50 ]]; then
    echo -e "${RED}🚨 CRITICAL: Success rate is below 50%${NC}"
    echo "   Immediate action required for system stability"
elif [[ $SUCCESS_RATE -lt 80 ]]; then
    echo -e "${YELLOW}⚠️  WARNING: Success rate is below 80%${NC}"
    echo "   Significant issues need attention"
else
    echo -e "${GREEN}✅ GOOD: Most endpoints are working${NC}"
    echo "   Focus on remaining issues"
fi

echo
echo "Next steps:"
echo "1. Fix empty route files immediately"
echo "2. Create missing critical endpoints"
echo "3. Resolve 405 Method Not Allowed errors"
echo "4. Test all endpoints with proper data"
echo "5. Add TypeScript validation for all APIs"

echo
echo "🏁 AUDIT COMPLETE"
echo "=================="
echo "Run this script again after fixes to track progress"