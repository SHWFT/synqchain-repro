#!/bin/bash

# CI/CD Quality Gates Script
# This script runs all quality checks that should pass before deployment

set -e

echo "🚀 Starting SynqChain CI Quality Checks"
echo "========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    if [ "$2" = "success" ]; then
        echo -e "${GREEN}✅ $1${NC}"
    elif [ "$2" = "error" ]; then
        echo -e "${RED}❌ $1${NC}"
    elif [ "$2" = "info" ]; then
        echo -e "${BLUE}ℹ️  $1${NC}"
    elif [ "$2" = "warning" ]; then
        echo -e "${YELLOW}⚠️  $1${NC}"
    fi
}

# Function to run a command and check its status
run_check() {
    local check_name="$1"
    local command="$2"
    
    print_status "Running $check_name..." "info"
    
    if eval "$command"; then
        print_status "$check_name passed" "success"
        return 0
    else
        print_status "$check_name failed" "error"
        return 1
    fi
}

# Set up error tracking
FAILED_CHECKS=()

# Check 1: Install dependencies
print_status "Installing dependencies..." "info"
npm ci --silent || {
    print_status "Failed to install dependencies" "error"
    exit 1
}

# Check 2: TypeScript compilation
run_check "TypeScript Compilation" "npm run typecheck" || FAILED_CHECKS+=("TypeScript")

# Check 3: Linting
run_check "ESLint" "npm run lint" || FAILED_CHECKS+=("Linting")

# Check 4: Formatting check
run_check "Prettier Format Check" "npm run format -- --check" || FAILED_CHECKS+=("Formatting")

# Check 5: Unit tests
run_check "Unit Tests" "npm run test:unit" || FAILED_CHECKS+=("Unit Tests")

# Check 6: E2E API tests
run_check "E2E API Tests" "npm run test:e2e:api" || FAILED_CHECKS+=("E2E API Tests")

# Check 7: Build
run_check "Build" "npm run build" || FAILED_CHECKS+=("Build")

# Summary
echo "========================================="
if [ ${#FAILED_CHECKS[@]} -eq 0 ]; then
    print_status "🎉 All quality checks passed! Ready for deployment." "success"
    exit 0
else
    print_status "💥 The following checks failed:" "error"
    for check in "${FAILED_CHECKS[@]}"; do
        echo "   - $check"
    done
    print_status "Please fix the failing checks before deployment." "error"
    exit 1
fi
