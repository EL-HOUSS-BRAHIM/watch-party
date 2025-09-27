#!/bin/bash

# =============================================================================
# OAUTH VARIABLES MIGRATION SCRIPT
# =============================================================================
# This script helps migrate from old OAuth variable names to new ones
# Author: Watch Party Team
# Version: 1.0

set -e

# Colors
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly CYAN='\033[0;36m'
readonly WHITE='\033[1;37m'
readonly NC='\033[0m'

readonly CHECK="✅"
readonly CROSS="❌"
readonly WARNING="⚠️"
readonly INFO="ℹ️"
readonly ROCKET="🚀"

log_info() { echo -e "${BLUE}${INFO} $1${NC}"; }
log_success() { echo -e "${GREEN}${CHECK} $1${NC}"; }
log_warning() { echo -e "${YELLOW}${WARNING} $1${NC}"; }
log_error() { echo -e "${RED}${CROSS} $1${NC}"; }
log_title() { echo -e "${WHITE}$1${NC}"; }

print_header() {
    echo
    echo -e "${CYAN}╔═══════════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║                    🔄 OAuth Variables Migration Tool                          ║${NC}"
    echo -e "${CYAN}╚═══════════════════════════════════════════════════════════════════════════════╝${NC}"
    echo
}

# Variable mappings
declare -A VARIABLE_MAPPINGS=(
    ["GOOGLE_OAUTH2_KEY"]="GOOGLE_OAUTH_CLIENT_ID"
    ["GOOGLE_OAUTH2_SECRET"]="GOOGLE_OAUTH_CLIENT_SECRET"
    ["GITHUB_CLIENT_ID"]="GITHUB_OAUTH_CLIENT_ID"
    ["GITHUB_CLIENT_SECRET"]="GITHUB_OAUTH_CLIENT_SECRET"
)

check_env_file() {
    local env_file="$1"
    
    if [[ ! -f "$env_file" ]]; then
        log_error "Environment file not found: $env_file"
        return 1
    fi
    
    log_info "Checking $env_file for old OAuth variable names..."
    
    local found_old_vars=()
    local needs_migration=false
    
    for old_var in "${!VARIABLE_MAPPINGS[@]}"; do
        if grep -q "^${old_var}=" "$env_file"; then
            found_old_vars+=("$old_var")
            needs_migration=true
        fi
    done
    
    if [[ $needs_migration == true ]]; then
        log_warning "Found old OAuth variables that need migration:"
        for var in "${found_old_vars[@]}"; do
            echo "  • $var → ${VARIABLE_MAPPINGS[$var]}"
        done
        return 0
    else
        log_success "No old OAuth variables found in $env_file"
        return 1
    fi
}

migrate_env_file() {
    local env_file="$1"
    local backup_file="${env_file}.backup.$(date +%Y%m%d_%H%M%S)"
    
    log_info "Creating backup: $backup_file"
    cp "$env_file" "$backup_file"
    
    log_info "Migrating OAuth variables in $env_file..."
    
    local temp_file=$(mktemp)
    
    # Process the file line by line
    while IFS= read -r line; do
        local migrated_line="$line"
        
        for old_var in "${!VARIABLE_MAPPINGS[@]}"; do
            local new_var="${VARIABLE_MAPPINGS[$old_var]}"
            
            # Replace the variable name if found at start of line
            if [[ "$line" =~ ^${old_var}= ]]; then
                migrated_line="${line/$old_var=/$new_var=}"
                log_success "  Migrated: $old_var → $new_var"
                break
            fi
        done
        
        echo "$migrated_line" >> "$temp_file"
    done < "$env_file"
    
    # Replace the original file
    mv "$temp_file" "$env_file"
    
    log_success "Migration completed for $env_file"
    log_info "Backup saved as: $backup_file"
}

migrate_github_secrets() {
    log_info "Checking GitHub repository secrets..."
    
    # Check if GitHub CLI is available
    if ! command -v gh &> /dev/null; then
        log_error "GitHub CLI not found. Please install it first."
        log_info "Visit: https://cli.github.com/"
        return 1
    fi
    
    # Check if authenticated
    if ! gh auth status &> /dev/null; then
        log_error "Not authenticated with GitHub CLI. Run: gh auth login"
        return 1
    fi
    
    # Check for old secrets
    local current_secrets=$(gh secret list --json name | jq -r '.[].name' 2>/dev/null)
    local found_old_secrets=()
    local migration_needed=false
    
    for old_var in "${!VARIABLE_MAPPINGS[@]}"; do
        if echo "$current_secrets" | grep -q "^$old_var$"; then
            found_old_secrets+=("$old_var")
            migration_needed=true
        fi
    done
    
    if [[ $migration_needed == false ]]; then
        log_success "No old OAuth secrets found in GitHub repository"
        return 0
    fi
    
    log_warning "Found old OAuth secrets that need migration:"
    for secret in "${found_old_secrets[@]}"; do
        echo "  • $secret → ${VARIABLE_MAPPINGS[$secret]}"
    done
    
    echo
    read -p "Do you want to migrate GitHub secrets automatically? (y/N): " -n 1 -r
    echo
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Skipping GitHub secrets migration"
        log_warning "You'll need to manually update your GitHub secrets"
        return 0
    fi
    
    # Migrate secrets
    for old_secret in "${found_old_secrets[@]}"; do
        local new_secret="${VARIABLE_MAPPINGS[$old_secret]}"
        
        log_info "Migrating secret: $old_secret → $new_secret"
        
        # Get the old secret value (this will prompt for confirmation)
        local secret_value
        secret_value=$(gh secret get "$old_secret" 2>/dev/null || true)
        
        if [[ -n "$secret_value" ]]; then
            # Set the new secret
            echo "$secret_value" | gh secret set "$new_secret" --no-store-on-cancel
            
            # Delete the old secret
            gh secret delete "$old_secret" --yes
            
            log_success "  Migrated: $old_secret → $new_secret"
        else
            log_warning "  Could not retrieve value for $old_secret"
        fi
    done
    
    log_success "GitHub secrets migration completed"
}

show_help() {
    echo -e "${WHITE}USAGE:${NC}"
    echo -e "  $0 [OPTIONS] [env_file]"
    echo
    echo -e "${WHITE}DESCRIPTION:${NC}"
    echo -e "  This script migrates OAuth variable names from old to new format."
    echo
    echo -e "${WHITE}OPTIONS:${NC}"
    echo -e "  ${GREEN}--check [env_file]${NC}       Check if migration is needed (default: .env)"
    echo -e "  ${GREEN}--migrate [env_file]${NC}     Migrate environment file (default: .env)"
    echo -e "  ${GREEN}--github-secrets${NC}         Migrate GitHub repository secrets"
    echo -e "  ${GREEN}--all [env_file]${NC}         Migrate both env file and GitHub secrets"
    echo -e "  ${GREEN}--help, -h${NC}               Show this help message"
    echo
    echo -e "${WHITE}EXAMPLES:${NC}"
    echo -e "  $0 --check                    # Check .env file"
    echo -e "  $0 --check .env.production    # Check specific file"
    echo -e "  $0 --migrate                  # Migrate .env file"
    echo -e "  $0 --github-secrets           # Migrate GitHub secrets"
    echo -e "  $0 --all                      # Migrate both .env and GitHub secrets"
    echo
    echo -e "${WHITE}VARIABLE MAPPINGS:${NC}"
    for old_var in "${!VARIABLE_MAPPINGS[@]}"; do
        echo -e "  ${YELLOW}$old_var${NC} → ${GREEN}${VARIABLE_MAPPINGS[$old_var]}${NC}"
    done
}

main() {
    print_header
    
    case "${1:-}" in
        --check)
            local env_file="${2:-.env}"
            check_env_file "$env_file" && log_warning "Migration needed!" || true
            ;;
        --migrate)
            local env_file="${2:-.env}"
            if check_env_file "$env_file"; then
                migrate_env_file "$env_file"
            else
                log_info "No migration needed for $env_file"
            fi
            ;;
        --github-secrets)
            migrate_github_secrets
            ;;
        --all)
            local env_file="${2:-.env}"
            
            # Check and migrate env file
            if check_env_file "$env_file"; then
                migrate_env_file "$env_file"
            else
                log_info "No migration needed for $env_file"
            fi
            
            echo
            
            # Migrate GitHub secrets
            migrate_github_secrets
            ;;
        --help|-h)
            show_help
            ;;
        *)
            log_info "OAuth Variables Migration Tool"
            echo
            echo -e "${WHITE}Available commands:${NC}"
            echo -e "  ${GREEN}$0 --check [env_file]${NC}        Check if migration is needed"
            echo -e "  ${GREEN}$0 --migrate [env_file]${NC}      Migrate environment file"
            echo -e "  ${GREEN}$0 --github-secrets${NC}          Migrate GitHub repository secrets"
            echo -e "  ${GREEN}$0 --all [env_file]${NC}          Migrate both env file and GitHub secrets"
            echo -e "  ${GREEN}$0 --help${NC}                    Show detailed help"
            echo
            
            # Auto-check for common files
            for env_file in ".env" ".env.production" ".env.local"; do
                if [[ -f "$env_file" ]]; then
                    echo
                    if check_env_file "$env_file"; then
                        log_warning "Run '$0 --migrate $env_file' to migrate this file"
                    fi
                fi
            done
            
            echo
            log_info "Run '$0 --github-secrets' to check and migrate GitHub repository secrets"
            ;;
    esac
}

main "$@"
