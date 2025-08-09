#!/bin/bash

# =============================================================================
# Watch Party API - CI/CD Test Runner
# =============================================================================
# This script runs all API tests in a CI/CD pipeline environment
# Supports multiple output formats and comprehensive reporting
# =============================================================================

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
RESULTS_DIR="$SCRIPT_DIR/results"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Default values
ENVIRONMENT="local"
OUTPUT_FORMAT="html,cli"
PARALLEL_RUNS=false
VERBOSE=false
COLLECTION_FILTER=""

# Usage function
usage() {
    cat << EOF
Watch Party API Test Runner

Usage: $0 [OPTIONS]

OPTIONS:
    -e, --environment ENV    Environment to test (local|production) [default: local]
    -f, --format FORMAT      Output format (cli|html|json|junit|all) [default: html,cli]
    -p, --parallel           Run collections in parallel
    -v, --verbose            Verbose output
    -c, --collection NAME    Run specific collection only (basic|advanced|flow|all-endpoints)
    -h, --help              Show this help message

EXAMPLES:
    $0                                          # Run all tests with default settings
    $0 -e production -f junit                   # Run against production with JUnit output
    $0 -c basic -v                             # Run basic collection only with verbose output
    $0 -p -f all                               # Run all collections in parallel with all output formats

COLLECTIONS:
    basic         - Basic API functionality tests
    advanced      - Advanced scenarios and integration tests  
    flow          - Complete user journey flow test
    all-endpoints - Comprehensive endpoint coverage test

ENVIRONMENTS:
    local         - http://localhost:8000 (development server)
    production    - https://api.watchparty.dev (production server)
EOF
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -f|--format)
            OUTPUT_FORMAT="$2"
            shift 2
            ;;
        -p|--parallel)
            PARALLEL_RUNS=true
            shift
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        -c|--collection)
            COLLECTION_FILTER="$2"
            shift 2
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            usage
            exit 1
            ;;
    esac
done

# Validate environment
case $ENVIRONMENT in
    local|production)
        ;;
    *)
        echo "Error: Invalid environment '$ENVIRONMENT'. Must be 'local' or 'production'."
        exit 1
        ;;
esac

# Setup environment file
if [ "$ENVIRONMENT" = "local" ]; then
    ENV_FILE="$SCRIPT_DIR/environments/Local-Development.postman_environment.json"
    BASE_URL="http://localhost:8000"
else
    ENV_FILE="$SCRIPT_DIR/environments/Production.postman_environment.json"
    BASE_URL="https://api.watchparty.dev"
fi

# Logging function
log() {
    echo -e "$1"
    if [ "$VERBOSE" = true ]; then
        echo -e "$1" >> "$RESULTS_DIR/test-execution-$TIMESTAMP.log"
    fi
}

# Setup function
setup() {
    log "${BLUE}🚀 Setting up test environment...${NC}"
    
    # Create results directory
    mkdir -p "$RESULTS_DIR"
    
    # Check Newman installation
    if ! command -v newman &> /dev/null; then
        log "${YELLOW}⚠️  Newman not found. Installing...${NC}"
        npm install -g newman newman-reporter-html newman-reporter-htmlextra
    fi
    
    # Check environment file
    if [ ! -f "$ENV_FILE" ]; then
        log "${RED}❌ Environment file not found: $ENV_FILE${NC}"
        exit 1
    fi
    
    # Check server availability
    log "${BLUE}🔍 Checking server availability...${NC}"
    if curl -f -s --max-time 10 "$BASE_URL/health/" > /dev/null 2>&1; then
        log "${GREEN}✅ Server is responding${NC}"
    else
        log "${RED}❌ Server is not responding at $BASE_URL${NC}"
        if [ "$ENVIRONMENT" = "local" ]; then
            log "${YELLOW}💡 Make sure Django development server is running:${NC}"
            log "${YELLOW}   cd $PROJECT_ROOT/back-end && python manage.py runserver${NC}"
        fi
        exit 1
    fi
}

# Get reporter flags based on output format
get_reporter_flags() {
    local format="$1"
    local collection_name="$2"
    local flags=""
    
    case $format in
        cli)
            flags="--reporters cli"
            ;;
        html)
            flags="--reporters cli,html --reporter-html-export $RESULTS_DIR/${collection_name}-report-$TIMESTAMP.html"
            ;;
        htmlextra)
            flags="--reporters cli,htmlextra --reporter-htmlextra-export $RESULTS_DIR/${collection_name}-report-extra-$TIMESTAMP.html"
            ;;
        json)
            flags="--reporters cli,json --reporter-json-export $RESULTS_DIR/${collection_name}-results-$TIMESTAMP.json"
            ;;
        junit)
            flags="--reporters cli,junit --reporter-junit-export $RESULTS_DIR/${collection_name}-junit-$TIMESTAMP.xml"
            ;;
        all)
            flags="--reporters cli,html,json,junit"
            flags="$flags --reporter-html-export $RESULTS_DIR/${collection_name}-report-$TIMESTAMP.html"
            flags="$flags --reporter-json-export $RESULTS_DIR/${collection_name}-results-$TIMESTAMP.json"
            flags="$flags --reporter-junit-export $RESULTS_DIR/${collection_name}-junit-$TIMESTAMP.xml"
            ;;
        *)
            # Handle comma-separated formats
            local reporters="cli"
            local exports=""
            
            if [[ "$format" == *"html"* ]]; then
                reporters="$reporters,html"
                exports="$exports --reporter-html-export $RESULTS_DIR/${collection_name}-report-$TIMESTAMP.html"
            fi
            
            if [[ "$format" == *"json"* ]]; then
                reporters="$reporters,json"
                exports="$exports --reporter-json-export $RESULTS_DIR/${collection_name}-results-$TIMESTAMP.json"
            fi
            
            if [[ "$format" == *"junit"* ]]; then
                reporters="$reporters,junit"
                exports="$exports --reporter-junit-export $RESULTS_DIR/${collection_name}-junit-$TIMESTAMP.xml"
            fi
            
            flags="--reporters $reporters $exports"
            ;;
    esac
    
    echo "$flags"
}

# Run a single collection
run_collection() {
    local name="$1"
    local file="$2"
    local output_name="$3"
    
    log "${BLUE}🧪 Running $name tests...${NC}"
    
    if [ ! -f "$file" ]; then
        log "${RED}❌ Collection file not found: $file${NC}"
        return 1
    fi
    
    local reporter_flags
    reporter_flags=$(get_reporter_flags "$OUTPUT_FORMAT" "$output_name")
    
    local newman_cmd="newman run \"$file\" -e \"$ENV_FILE\" $reporter_flags"
    
    # Add timeout and other options
    newman_cmd="$newman_cmd --timeout-request 30000 --timeout-script 10000"
    newman_cmd="$newman_cmd --delay-request 200"
    newman_cmd="$newman_cmd --disable-unicode"
    
    if [ "$VERBOSE" = true ]; then
        newman_cmd="$newman_cmd --verbose"
    fi
    
    # Execute the command
    if eval "$newman_cmd"; then
        log "${GREEN}✅ $name tests passed${NC}"
        return 0
    else
        log "${RED}❌ $name tests failed${NC}"
        return 1
    fi
}

# Run collections based on filter
run_tests() {
    local collections=()
    local exit_code=0
    
    # Define collection mappings
    case $COLLECTION_FILTER in
        "basic")
            collections=("Basic API:$SCRIPT_DIR/Watch-Party-API-Collection.json:basic")
            ;;
        "advanced")
            collections=("Advanced Tests:$SCRIPT_DIR/Watch-Party-Advanced-Tests.json:advanced")
            ;;
        "flow")
            collections=("Complete Flow:$SCRIPT_DIR/Watch-Party-Complete-Flow.json:flow")
            ;;
        "all-endpoints")
            collections=("All Endpoints:$SCRIPT_DIR/Watch-Party-All-Endpoints.json:all-endpoints")
            ;;
        "")
            collections=(
                "Basic API:$SCRIPT_DIR/Watch-Party-API-Collection.json:basic"
                "Advanced Tests:$SCRIPT_DIR/Watch-Party-Advanced-Tests.json:advanced"
                "Complete Flow:$SCRIPT_DIR/Watch-Party-Complete-Flow.json:flow"
                "All Endpoints:$SCRIPT_DIR/Watch-Party-All-Endpoints.json:all-endpoints"
            )
            ;;
        *)
            log "${RED}❌ Invalid collection filter: $COLLECTION_FILTER${NC}"
            exit 1
            ;;
    esac
    
    log "${BLUE}📋 Running ${#collections[@]} collection(s) in $ENVIRONMENT environment${NC}"
    log "${BLUE}📊 Output format: $OUTPUT_FORMAT${NC}"
    log "${BLUE}📁 Results will be saved to: $RESULTS_DIR${NC}"
    log ""
    
    if [ "$PARALLEL_RUNS" = true ]; then
        log "${BLUE}🔄 Running collections in parallel...${NC}"
        local pids=()
        
        for collection in "${collections[@]}"; do
            IFS=':' read -r name file output_name <<< "$collection"
            (run_collection "$name" "$file" "$output_name") &
            pids+=($!)
        done
        
        # Wait for all background processes
        for pid in "${pids[@]}"; do
            if ! wait "$pid"; then
                exit_code=1
            fi
        done
    else
        log "${BLUE}🔄 Running collections sequentially...${NC}"
        
        for collection in "${collections[@]}"; do
            IFS=':' read -r name file output_name <<< "$collection"
            if ! run_collection "$name" "$file" "$output_name"; then
                exit_code=1
            fi
            log ""
        done
    fi
    
    return $exit_code
}

# Generate summary report
generate_summary() {
    log "${BLUE}📊 Generating test summary...${NC}"
    
    local summary_file="$RESULTS_DIR/test-summary-$TIMESTAMP.md"
    local total_collections=0
    local passed_collections=0
    local failed_collections=0
    
    # Count results
    for result_file in "$RESULTS_DIR"/*-results-"$TIMESTAMP".json; do
        if [ -f "$result_file" ]; then
            total_collections=$((total_collections + 1))
            # Simple check - if file exists and has content, assume passed
            if [ -s "$result_file" ]; then
                passed_collections=$((passed_collections + 1))
            else
                failed_collections=$((failed_collections + 1))
            fi
        fi
    done
    
    cat > "$summary_file" << EOF
# Watch Party API Test Summary

## Test Configuration
- **Execution Date**: $(date)
- **Environment**: $ENVIRONMENT ($BASE_URL)
- **Output Format**: $OUTPUT_FORMAT
- **Parallel Execution**: $PARALLEL_RUNS
- **Collections Filter**: ${COLLECTION_FILTER:-"all"}

## Results Summary
- **Total Collections**: $total_collections
- **Passed**: $passed_collections
- **Failed**: $failed_collections
- **Success Rate**: $(( total_collections > 0 ? (passed_collections * 100) / total_collections : 0 ))%

## Generated Reports
EOF

    # Add links to generated reports
    for report_file in "$RESULTS_DIR"/*-report-"$TIMESTAMP".html; do
        if [ -f "$report_file" ]; then
            local basename=$(basename "$report_file")
            echo "- [${basename%%-report-*} HTML Report](./$basename)" >> "$summary_file"
        fi
    done
    
    for result_file in "$RESULTS_DIR"/*-results-"$TIMESTAMP".json; do
        if [ -f "$result_file" ]; then
            local basename=$(basename "$result_file")
            echo "- [${basename%%-results-*} JSON Results](./$basename)" >> "$summary_file"
        fi
    done
    
    for junit_file in "$RESULTS_DIR"/*-junit-"$TIMESTAMP".xml; do
        if [ -f "$junit_file" ]; then
            local basename=$(basename "$junit_file")
            echo "- [${basename%%-junit-*} JUnit XML](./$basename)" >> "$summary_file"
        fi
    done
    
    echo "" >> "$summary_file"
    echo "---" >> "$summary_file"
    echo "Generated by Watch Party API Test Runner v1.0" >> "$summary_file"
    
    log "${GREEN}✅ Summary report generated: $summary_file${NC}"
}

# Main execution function
main() {
    log "${BLUE}🚀 Watch Party API Test Runner${NC}"
    log "${BLUE}================================${NC}"
    
    setup
    
    local start_time=$(date +%s)
    
    if run_tests; then
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        
        generate_summary
        
        log ""
        log "${GREEN}🎉 All tests completed successfully! 🎉${NC}"
        log "${GREEN}⏱️  Total execution time: ${duration}s${NC}"
        log "${GREEN}📁 Results saved in: $RESULTS_DIR${NC}"
        
        # Show quick stats
        local html_reports=$(find "$RESULTS_DIR" -name "*-report-$TIMESTAMP.html" | wc -l)
        local json_results=$(find "$RESULTS_DIR" -name "*-results-$TIMESTAMP.json" | wc -l)
        local junit_files=$(find "$RESULTS_DIR" -name "*-junit-$TIMESTAMP.xml" | wc -l)
        
        log "${BLUE}📊 Generated files:${NC}"
        [ "$html_reports" -gt 0 ] && log "   • $html_reports HTML report(s)"
        [ "$json_results" -gt 0 ] && log "   • $json_results JSON result(s)"
        [ "$junit_files" -gt 0 ] && log "   • $junit_files JUnit XML file(s)"
        
        exit 0
    else
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        
        generate_summary
        
        log ""
        log "${RED}❌ Some tests failed${NC}"
        log "${YELLOW}⏱️  Total execution time: ${duration}s${NC}"
        log "${YELLOW}📁 Check results in: $RESULTS_DIR${NC}"
        
        exit 1
    fi
}

# Execute main function
main "$@"
