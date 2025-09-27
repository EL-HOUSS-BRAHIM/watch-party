#!/bin/bash

# =============================================================================
# WATCH PARTY BACKEND - SECURITY SCRIPT
# =============================================================================
# Handles security checks, vulnerability scanning, and security configurations
# Author: Watch Party Team
# Version: 1.0
# Last Updated: August 11, 2025

set -e

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors and emojis
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly MAGENTA='\033[0;35m'
readonly NC='\033[0m'
readonly CHECK="✅"
readonly CROSS="❌"
readonly WARNING="⚠️"
readonly INFO="ℹ️"
readonly SHIELD="🛡️"
readonly LOCK="🔒"

# Logging functions
log_info() { echo -e "${BLUE}${INFO} $1${NC}"; }
log_success() { echo -e "${GREEN}${CHECK} $1${NC}"; }
log_warning() { echo -e "${YELLOW}${WARNING} $1${NC}"; }
log_error() { echo -e "${RED}${CROSS} $1${NC}"; }
log_security() { echo -e "${MAGENTA}${SHIELD} $1${NC}"; }

# Security tools configuration
BANDIT_CONFIG="$PROJECT_ROOT/.bandit"
SAFETY_DB_PATH="$PROJECT_ROOT/.safety_db"

# =============================================================================
# UTILITY FUNCTIONS
# =============================================================================

check_python_env() {
    local python_cmd="python3"
    
    # Check if virtual environment exists and use it
    if [[ -f "$PROJECT_ROOT/venv/bin/python" ]]; then
        python_cmd="$PROJECT_ROOT/venv/bin/python"
    fi
    
    if ! command -v "$python_cmd" &> /dev/null; then
        log_error "Python is not available"
        exit 1
    fi
    
    echo "$python_cmd"
}

get_pip_cmd() {
    if [[ -f "$PROJECT_ROOT/venv/bin/pip" ]]; then
        echo "$PROJECT_ROOT/venv/bin/pip"
    else
        echo "pip3"
    fi
}

install_security_tools() {
    log_info "Installing security tools..."
    
    local pip_cmd
    pip_cmd=$(get_pip_cmd)
    
    # Install security scanning tools
    $pip_cmd install --upgrade \
        bandit \
        safety \
        semgrep \
        pip-audit \
        django-security-check
    
    log_success "Security tools installed"
}

# =============================================================================
# VULNERABILITY SCANNING
# =============================================================================

scan_dependencies() {
    log_security "Scanning dependencies for known vulnerabilities..."
    
    local pip_cmd
    pip_cmd=$(get_pip_cmd)
    local issues=0
    
    echo "🔍 Running Safety check..."
    if $pip_cmd list --format=freeze | safety check --stdin --json > safety_report.json 2>/dev/null; then
        log_success "Safety: No known vulnerabilities found"
    else
        log_warning "Safety: Vulnerabilities detected"
        if [[ -f safety_report.json ]]; then
            echo "Details saved to safety_report.json"
        fi
        ((issues++))
    fi
    
    echo
    echo "🔍 Running pip-audit..."
    if command -v pip-audit &> /dev/null; then
        if pip-audit --format=json --output=pip_audit_report.json 2>/dev/null; then
            log_success "pip-audit: No vulnerabilities found"
        else
            log_warning "pip-audit: Issues detected"
            ((issues++))
        fi
    else
        log_info "pip-audit not available, installing..."
        $pip_cmd install pip-audit
        pip-audit --format=json --output=pip_audit_report.json || ((issues++))
    fi
    
    # Clean up temporary files
    rm -f safety_report.json pip_audit_report.json
    
    return $issues
}

scan_code_vulnerabilities() {
    log_security "Scanning code for security vulnerabilities..."
    
    local python_cmd
    python_cmd=$(check_python_env)
    local issues=0
    
    # Bandit scan
    echo "🔍 Running Bandit security scan..."
    if command -v bandit &> /dev/null; then
        local bandit_output
        bandit_output=$(mktemp)
        
        if bandit -r "$PROJECT_ROOT" -f json -o "$bandit_output" -ll 2>/dev/null; then
            log_success "Bandit: No high-severity issues found"
        else
            log_warning "Bandit: Security issues detected"
            echo "Report saved to bandit_report.json"
            cp "$bandit_output" bandit_report.json 2>/dev/null || true
            ((issues++))
        fi
        
        rm -f "$bandit_output"
    else
        log_warning "Bandit not installed. Installing..."
        $(get_pip_cmd) install bandit
        bandit -r "$PROJECT_ROOT" -f json -o bandit_report.json -ll || ((issues++))
    fi
    
    # Semgrep scan (if available)
    echo
    echo "🔍 Running Semgrep scan..."
    if command -v semgrep &> /dev/null; then
        if semgrep --config=auto --json --output=semgrep_report.json "$PROJECT_ROOT" 2>/dev/null; then
            local findings
            findings=$(jq '.results | length' semgrep_report.json 2>/dev/null || echo "0")
            if [[ "$findings" -eq 0 ]]; then
                log_success "Semgrep: No issues found"
            else
                log_warning "Semgrep: $findings issues found"
                ((issues++))
            fi
        else
            log_warning "Semgrep scan failed"
        fi
        rm -f semgrep_report.json
    else
        log_info "Semgrep not available (optional)"
    fi
    
    return $issues
}

check_django_security() {
    log_security "Checking Django security configuration..."
    
    local python_cmd
    python_cmd=$(check_python_env)
    local issues=0
    
    # Django security check
    echo "🔍 Running Django security check..."
    cd "$PROJECT_ROOT"
    
    if $python_cmd manage.py check --deploy 2>&1 | tee django_security_check.log; then
        if grep -q "System check identified no issues" django_security_check.log; then
            log_success "Django: No security issues found"
        else
            log_warning "Django: Security issues detected"
            ((issues++))
        fi
    else
        log_error "Django security check failed"
        ((issues++))
    fi
    
    rm -f django_security_check.log
    
    return $issues
}

# =============================================================================
# SECURITY CONFIGURATION
# =============================================================================

create_bandit_config() {
    log_info "Creating Bandit configuration..."
    
    cat > "$BANDIT_CONFIG" << 'EOF'
[bandit]
exclude = */migrations/*,*/venv/*,*/env/*,*/tests/*,*/test_*,*_test.py
skips = B101,B601

[bandit.assert_used]
skips = ['*_test.py', '*/test_*.py']
EOF
    
    log_success "Bandit configuration created"
}

setup_pre_commit_hooks() {
    log_info "Setting up pre-commit security hooks..."
    
    local pip_cmd
    pip_cmd=$(get_pip_cmd)
    
    # Install pre-commit
    $pip_cmd install pre-commit
    
    # Create pre-commit configuration
    cat > "$PROJECT_ROOT/.pre-commit-config.yaml" << 'EOF'
repos:
  - repo: https://github.com/psf/black
    rev: 23.3.0
    hooks:
      - id: black
        language_version: python3

  - repo: https://github.com/pycqa/isort
    rev: 5.12.0
    hooks:
      - id: isort

  - repo: https://github.com/pycqa/flake8
    rev: 6.0.0
    hooks:
      - id: flake8

  - repo: https://github.com/PyCQA/bandit
    rev: 1.7.5
    hooks:
      - id: bandit
        args: ['-c', '.bandit']

  - repo: https://github.com/Lucas-C/pre-commit-hooks-safety
    rev: v1.3.2
    hooks:
      - id: python-safety-dependencies-check

  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.4.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: check-added-large-files
      - id: detect-private-key

  - repo: https://github.com/Yelp/detect-secrets
    rev: v1.4.0
    hooks:
      - id: detect-secrets
        args: ['--baseline', '.secrets.baseline']
EOF
    
    # Install hooks
    cd "$PROJECT_ROOT"
    pre-commit install
    
    log_success "Pre-commit hooks installed"
}

generate_secret_key() {
    log_info "Generating secure Django secret key..."
    
    local python_cmd
    python_cmd=$(check_python_env)
    
    local secret_key
    secret_key=$($python_cmd -c "
import secrets
import string
alphabet = string.ascii_letters + string.digits + '!@#$%^&*(-_=+)'
secret_key = ''.join(secrets.choice(alphabet) for i in range(50))
print(secret_key)
")
    
    echo "Generated secret key:"
    echo "$secret_key"
    echo
    log_warning "Save this key securely and add it to your environment variables"
    echo "Example: export SECRET_KEY='$secret_key'"
}

check_environment_security() {
    log_security "Checking environment security configuration..."
    
    local issues=0
    
    # Check for .env file
    if [[ -f "$PROJECT_ROOT/.env" ]]; then
        log_success "Environment file exists"
        
        # Check for sensitive data in .env
        if grep -q "SECRET_KEY.*=.*secret" "$PROJECT_ROOT/.env" 2>/dev/null; then
            log_warning "Default secret key detected in .env file"
            ((issues++))
        fi
        
        if grep -q "DEBUG.*=.*True" "$PROJECT_ROOT/.env" 2>/dev/null; then
            log_warning "DEBUG=True found in .env (ensure this is not production)"
        fi
    else
        log_warning "No .env file found"
        ((issues++))
    fi
    
    # Check .gitignore for security files
    if [[ -f "$PROJECT_ROOT/.gitignore" ]]; then
        if grep -q "\.env" "$PROJECT_ROOT/.gitignore" 2>/dev/null; then
            log_success ".env file is properly ignored by Git"
        else
            log_warning ".env file should be added to .gitignore"
            ((issues++))
        fi
    else
        log_warning "No .gitignore file found"
        ((issues++))
    fi
    
    return $issues
}

# =============================================================================
# SECURITY HARDENING
# =============================================================================

check_file_permissions() {
    log_security "Checking file permissions..."
    
    local issues=0
    
    # Check for world-writable files
    echo "🔍 Checking for world-writable files..."
    local writable_files
    writable_files=$(find "$PROJECT_ROOT" -type f -perm -002 2>/dev/null | grep -v "/venv/" | head -10)
    
    if [[ -n "$writable_files" ]]; then
        log_warning "World-writable files found:"
        echo "$writable_files"
        ((issues++))
    else
        log_success "No world-writable files found"
    fi
    
    # Check for files with execute permission that shouldn't have it
    echo
    echo "🔍 Checking for suspicious executable files..."
    local suspicious_executables
    suspicious_executables=$(find "$PROJECT_ROOT" -name "*.py" -perm -111 2>/dev/null | grep -v "/venv/" | grep -v "manage.py" | head -10)
    
    if [[ -n "$suspicious_executables" ]]; then
        log_warning "Python files with execute permission:"
        echo "$suspicious_executables"
    else
        log_success "No suspicious executable Python files"
    fi
    
    return $issues
}

scan_secrets() {
    log_security "Scanning for accidentally committed secrets..."
    
    local issues=0
    
    # Common secret patterns
    local secret_patterns=(
        "password\s*=\s*['\"][^'\"]*['\"]"
        "secret\s*=\s*['\"][^'\"]*['\"]"
        "api_key\s*=\s*['\"][^'\"]*['\"]"
        "token\s*=\s*['\"][^'\"]*['\"]"
        "-----BEGIN.*PRIVATE KEY-----"
        "sk_live_[0-9a-zA-Z]+"
        "AKIA[0-9A-Z]{16}"
    )
    
    echo "🔍 Scanning for potential secrets..."
    
    for pattern in "${secret_patterns[@]}"; do
        local matches
        matches=$(grep -r -E "$pattern" "$PROJECT_ROOT" --exclude-dir=venv --exclude-dir=.git --exclude="*.log" 2>/dev/null | head -5)
        
        if [[ -n "$matches" ]]; then
            log_warning "Potential secrets found matching pattern: $pattern"
            echo "$matches"
            ((issues++))
        fi
    done
    
    if [[ $issues -eq 0 ]]; then
        log_success "No obvious secrets found in code"
    fi
    
    return $issues
}

# =============================================================================
# SECURITY REPORTS
# =============================================================================

generate_security_report() {
    log_security "Generating comprehensive security report..."
    
    local report_file="security_report_$(date +%Y%m%d_%H%M%S).txt"
    local total_issues=0
    
    {
        echo "=========================================="
        echo "WATCH PARTY BACKEND - SECURITY REPORT"
        echo "Generated: $(date)"
        echo "=========================================="
        echo
        
        echo "1. DEPENDENCY VULNERABILITIES"
        echo "=============================="
        scan_dependencies || ((total_issues += $?))
        echo
        
        echo "2. CODE SECURITY SCAN"
        echo "===================="
        scan_code_vulnerabilities || ((total_issues += $?))
        echo
        
        echo "3. DJANGO SECURITY CHECK"
        echo "========================"
        check_django_security || ((total_issues += $?))
        echo
        
        echo "4. ENVIRONMENT SECURITY"
        echo "======================="
        check_environment_security || ((total_issues += $?))
        echo
        
        echo "5. FILE PERMISSIONS"
        echo "=================="
        check_file_permissions || ((total_issues += $?))
        echo
        
        echo "6. SECRET SCANNING"
        echo "=================="
        scan_secrets || ((total_issues += $?))
        echo
        
        echo "=========================================="
        echo "SUMMARY"
        echo "=========================================="
        echo "Total security issues found: $total_issues"
        echo
        
        if [[ $total_issues -eq 0 ]]; then
            echo "✅ No major security issues detected"
        else
            echo "⚠️  Security issues require attention"
            echo "Review the details above and address the identified issues"
        fi
        
    } | tee "$report_file"
    
    log_success "Security report saved to: $report_file"
    return $total_issues
}

# =============================================================================
# QUICK SECURITY FIXES
# =============================================================================

quick_security_fixes() {
    log_security "Applying quick security fixes..."
    
    # Fix file permissions
    echo "🔧 Fixing file permissions..."
    find "$PROJECT_ROOT" -type f -name "*.py" -not -path "*/venv/*" -not -name "manage.py" -exec chmod -x {} \; 2>/dev/null || true
    find "$PROJECT_ROOT" -type f -perm -002 -not -path "*/venv/*" -exec chmod o-w {} \; 2>/dev/null || true
    
    # Create/update .gitignore for security
    if [[ -f "$PROJECT_ROOT/.gitignore" ]]; then
        if ! grep -q "\.env" "$PROJECT_ROOT/.gitignore"; then
            echo ".env" >> "$PROJECT_ROOT/.gitignore"
        fi
        if ! grep -q "\.secret" "$PROJECT_ROOT/.gitignore"; then
            echo "*.secret" >> "$PROJECT_ROOT/.gitignore"
        fi
        if ! grep -q "\.key" "$PROJECT_ROOT/.gitignore"; then
            echo "*.key" >> "$PROJECT_ROOT/.gitignore"
        fi
    fi
    
    # Create security configuration files
    create_bandit_config
    
    log_success "Quick security fixes applied"
}

# =============================================================================
# SECURITY MONITORING
# =============================================================================

setup_security_monitoring() {
    log_security "Setting up security monitoring..."
    
    # Create security check script
    cat > "$PROJECT_ROOT/security_check.py" << 'EOF'
#!/usr/bin/env python3
"""
Security monitoring script for Watch Party Backend
Performs basic security checks and sends alerts if issues are found
"""

import os
import sys
import subprocess
import json
from datetime import datetime

def run_command(cmd):
    """Run a command and return its output"""
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        return result.returncode == 0, result.stdout, result.stderr
    except Exception as e:
        return False, "", str(e)

def check_dependencies():
    """Check for vulnerable dependencies"""
    success, output, error = run_command("pip list --format=freeze | safety check --stdin")
    return success, "Dependencies" if success else f"Vulnerable dependencies found: {error}"

def check_django_security():
    """Check Django security configuration"""
    success, output, error = run_command("python manage.py check --deploy")
    return success, "Django configuration" if success else f"Django security issues: {error}"

def main():
    checks = [
        ("Dependencies", check_dependencies),
        ("Django Security", check_django_security),
    ]
    
    results = []
    issues_found = False
    
    print(f"🛡️  Security Check - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 50)
    
    for name, check_func in checks:
        try:
            success, message = check_func()
            status = "✅ PASS" if success else "❌ FAIL"
            print(f"{name}: {status}")
            if not success:
                print(f"  Details: {message}")
                issues_found = True
            results.append({"check": name, "success": success, "message": message})
        except Exception as e:
            print(f"{name}: ❌ ERROR - {e}")
            issues_found = True
    
    print("=" * 50)
    
    if issues_found:
        print("⚠️  Security issues detected! Please review and fix.")
        sys.exit(1)
    else:
        print("✅ All security checks passed!")
        sys.exit(0)

if __name__ == "__main__":
    main()
EOF
    
    chmod +x "$PROJECT_ROOT/security_check.py"
    
    # Create cron job script
    cat > "$PROJECT_ROOT/setup_security_cron.sh" << 'EOF'
#!/bin/bash
# Setup daily security checks

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CRON_JOB="0 2 * * * cd $SCRIPT_DIR && python3 security_check.py >> logs/security_check.log 2>&1"

# Add to crontab if not already present
(crontab -l 2>/dev/null | grep -v "security_check.py"; echo "$CRON_JOB") | crontab -

echo "✅ Security monitoring cron job installed"
echo "Daily security checks will run at 2 AM"
EOF
    
    chmod +x "$PROJECT_ROOT/setup_security_cron.sh"
    
    log_success "Security monitoring scripts created"
    log_info "Run ./setup_security_cron.sh to enable daily security checks"
}

# =============================================================================
# MAIN FUNCTIONS
# =============================================================================

show_help() {
    echo "Watch Party Security Script"
    echo
    echo "USAGE:"
    echo "  $0 [COMMAND] [OPTIONS]"
    echo
    echo "SCANNING COMMANDS:"
    echo "  scan               Full security scan (all checks)"
    echo "  deps               Scan dependencies for vulnerabilities"
    echo "  code               Scan code for security issues"
    echo "  django             Check Django security configuration"
    echo "  secrets            Scan for accidentally committed secrets"
    echo "  permissions        Check file permissions"
    echo
    echo "SETUP COMMANDS:"
    echo "  setup              Install security tools and configurations"
    echo "  config             Create security configuration files"
    echo "  hooks              Setup pre-commit security hooks"
    echo "  monitoring         Setup security monitoring"
    echo
    echo "UTILITY COMMANDS:"
    echo "  report             Generate comprehensive security report"
    echo "  fix                Apply quick security fixes"
    echo "  secret-key         Generate secure Django secret key"
    echo "  env-check          Check environment security"
    echo
    echo "OPTIONS:"
    echo "  --install          Install required security tools"
    echo "  --force            Skip confirmations"
    echo
    echo "EXAMPLES:"
    echo "  $0 scan            # Run full security scan"
    echo "  $0 setup           # Setup security tools"
    echo "  $0 report          # Generate security report"
    echo "  $0 fix             # Apply quick fixes"
}

main() {
    local command="${1:-help}"
    shift || true
    
    case "$command" in
        scan|check)
            log_security "Running full security scan..."
            local total_issues=0
            scan_dependencies || ((total_issues += $?))
            scan_code_vulnerabilities || ((total_issues += $?))
            check_django_security || ((total_issues += $?))
            check_environment_security || ((total_issues += $?))
            check_file_permissions || ((total_issues += $?))
            scan_secrets || ((total_issues += $?))
            
            echo
            if [[ $total_issues -eq 0 ]]; then
                log_success "Security scan completed - no major issues found"
            else
                log_warning "Security scan completed - $total_issues issues found"
            fi
            ;;
        deps|dependencies)
            scan_dependencies
            ;;
        code|bandit)
            scan_code_vulnerabilities
            ;;
        django)
            check_django_security
            ;;
        secrets)
            scan_secrets
            ;;
        permissions)
            check_file_permissions
            ;;
        setup|install)
            install_security_tools
            create_bandit_config
            setup_pre_commit_hooks
            ;;
        config)
            create_bandit_config
            ;;
        hooks)
            setup_pre_commit_hooks
            ;;
        monitoring)
            setup_security_monitoring
            ;;
        report)
            generate_security_report
            ;;
        fix|fixes)
            quick_security_fixes
            ;;
        secret-key|secretkey)
            generate_secret_key
            ;;
        env-check|env)
            check_environment_security
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            log_error "Unknown command: $command"
            show_help
            exit 1
            ;;
    esac
}

# Only run main if script is executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
