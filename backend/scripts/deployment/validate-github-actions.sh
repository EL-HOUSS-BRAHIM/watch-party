#!/bin/bash

# =============================================================================
# GITHUB ACTIONS VALIDATION SCRIPT
# =============================================================================
# This script validates the GitHub Actions deployment setup

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m'

readonly CHECK="✅"
readonly CROSS="❌"
readonly WARNING="⚠️"
readonly INFO="ℹ️"

log_info() { echo -e "${BLUE}${INFO} $1${NC}"; }
log_success() { echo -e "${GREEN}${CHECK} $1${NC}"; }
log_warning() { echo -e "${YELLOW}${WARNING} $1${NC}"; }
log_error() { echo -e "${RED}${CROSS} $1${NC}"; }

print_header() {
    echo
    echo -e "${BLUE}╔═══════════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║                    🔍 GitHub Actions Setup Validation                        ║${NC}"
    echo -e "${BLUE}╚═══════════════════════════════════════════════════════════════════════════════╝${NC}"
    echo
}

check_workflow_files() {
    log_info "Checking workflow files..."
    
    local workflows_dir="$PROJECT_ROOT/.github/workflows"
    local required_files=(
        "deploy.yml"
        "health-check.yml"
        "backup.yml"
    )
    
    if [[ ! -d "$workflows_dir" ]]; then
        log_error "Workflows directory not found: $workflows_dir"
        return 1
    fi
    
    local missing_files=()
    for file in "${required_files[@]}"; do
        if [[ ! -f "$workflows_dir/$file" ]]; then
            missing_files+=("$file")
        fi
    done
    
    if [ ${#missing_files[@]} -eq 0 ]; then
        log_success "All workflow files are present"
        return 0
    else
        log_error "Missing workflow files: ${missing_files[*]}"
        return 1
    fi
}

check_scripts() {
    log_info "Checking deployment scripts..."
    
    local scripts_dir="$PROJECT_ROOT/scripts"
    local required_scripts=(
        "deployment.sh"
        "production.sh" 
        "server-setup.sh"
        "verify-deployment.sh"
        "github-actions-setup.sh"
    )
    
    local missing_scripts=()
    for script in "${required_scripts[@]}"; do
        local script_path="$scripts_dir/$script"
        if [[ ! -f "$script_path" ]]; then
            missing_scripts+=("$script")
        elif [[ ! -x "$script_path" ]]; then
            log_warning "Script not executable: $script"
            chmod +x "$script_path"
        fi
    done
    
    if [ ${#missing_scripts[@]} -eq 0 ]; then
        log_success "All deployment scripts are present and executable"
        return 0
    else
        log_error "Missing deployment scripts: ${missing_scripts[*]}"
        return 1
    fi
}

check_manage_script() {
    log_info "Checking manage.sh script..."
    
    local manage_script="$PROJECT_ROOT/manage.sh"
    
    if [[ ! -f "$manage_script" ]]; then
        log_error "manage.sh not found"
        return 1
    fi
    
    if [[ ! -x "$manage_script" ]]; then
        log_warning "manage.sh is not executable"
        chmod +x "$manage_script"
    fi
    
    # Check if new commands are available
    local new_commands=("verify-deployment" "github-setup")
    local missing_commands=()
    
    for cmd in "${new_commands[@]}"; do
        if ! grep -q "$cmd" "$manage_script"; then
            missing_commands+=("$cmd")
        fi
    done
    
    if [ ${#missing_commands[@]} -eq 0 ]; then
        log_success "manage.sh has all required commands"
        return 0
    else
        log_error "Missing commands in manage.sh: ${missing_commands[*]}"
        return 1
    fi
}

check_git_repository() {
    log_info "Checking Git repository..."
    
    if [[ ! -d "$PROJECT_ROOT/.git" ]]; then
        log_error "Not a Git repository"
        return 1
    fi
    
    # Check if there's a remote repository
    if ! git remote -v &>/dev/null; then
        log_warning "No remote repository configured"
    else
        log_success "Git repository configured"
    fi
    
    # Check current branch
    local current_branch=$(git branch --show-current 2>/dev/null || echo "unknown")
    if [[ "$current_branch" == "master" || "$current_branch" == "main" ]]; then
        log_success "On deployment branch: $current_branch"
    else
        log_warning "Not on main deployment branch (current: $current_branch)"
    fi
    
    return 0
}

check_environment_template() {
    log_info "Checking environment configuration..."
    
    local env_files=("$PROJECT_ROOT/.env" "$PROJECT_ROOT/.env.production")
    local has_env_file=false
    
    for env_file in "${env_files[@]}"; do
        if [[ -f "$env_file" ]]; then
            has_env_file=true
            log_success "Found environment file: $(basename "$env_file")"
            break
        fi
    done
    
    if [[ "$has_env_file" == false ]]; then
        log_warning "No environment file found"
        log_info "Run: ./manage.sh github-setup --generate to create a template"
    fi
    
    return 0
}

check_project_structure() {
    log_info "Checking project structure..."
    
    local required_dirs=(
        "apps"
        "core"
        "scripts"
        "static"
        "templates"
    )
    
    local missing_dirs=()
    for dir in "${required_dirs[@]}"; do
        if [[ ! -d "$PROJECT_ROOT/$dir" ]]; then
            missing_dirs+=("$dir")
        fi
    done
    
    if [ ${#missing_dirs[@]} -eq 0 ]; then
        log_success "Project structure is valid"
        return 0
    else
        log_error "Missing directories: ${missing_dirs[*]}"
        return 1
    fi
}

suggest_next_steps() {
    echo
    echo -e "${BLUE}📋 Next Steps:${NC}"
    echo
    echo "1. Generate secrets template:"
    echo "   ./manage.sh github-setup --generate"
    echo
    echo "2. Configure GitHub repository secrets:"
    echo "   - Go to GitHub repository → Settings → Secrets and variables → Actions"
    echo "   - Add all secrets from the generated template"
    echo
    echo "3. Test the deployment workflow:"
    echo "   - Push changes to master/main branch, or"
    echo "   - Manually trigger the workflow from GitHub Actions tab"
    echo
    echo "4. Monitor deployment:"
    echo "   - Check GitHub Actions logs"
    echo "   - Verify deployment with: ./manage.sh verify-deployment"
    echo
}

generate_validation_report() {
    local overall_status="$1"
    
    echo
    echo "=========================================="
    echo "    GITHUB ACTIONS VALIDATION REPORT"
    echo "=========================================="
    echo "Timestamp: $(date)"
    echo "Project: Watch Party Backend"
    echo
    
    if [ "$overall_status" = "success" ]; then
        echo "✅ OVERALL STATUS: READY FOR DEPLOYMENT"
        echo
        echo "Your GitHub Actions deployment setup is ready!"
        suggest_next_steps
    else
        echo "❌ OVERALL STATUS: SETUP INCOMPLETE"
        echo
        echo "Please fix the identified issues before deploying."
    fi
    
    echo
    echo "=========================================="
}

main() {
    print_header
    
    local checks=(
        "check_workflow_files"
        "check_scripts"
        "check_manage_script"
        "check_git_repository"
        "check_environment_template"
        "check_project_structure"
    )
    
    local failed_checks=()
    
    for check in "${checks[@]}"; do
        if ! $check; then
            failed_checks+=("$check")
        fi
        echo
    done
    
    if [ ${#failed_checks[@]} -eq 0 ]; then
        generate_validation_report "success"
        exit 0
    else
        generate_validation_report "failed"
        echo "Failed checks: ${failed_checks[*]}"
        exit 1
    fi
}

case "${1:-}" in
    --help|-h)
        echo "GitHub Actions Setup Validation Script"
        echo
        echo "Usage: $0"
        echo
        echo "This script validates your GitHub Actions deployment setup"
        echo "and ensures all required files and configurations are present."
        ;;
    *)
        main
        ;;
esac
