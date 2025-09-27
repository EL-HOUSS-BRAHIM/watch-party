#!/bin/bash

# =============================================================================
# WATCH PARTY BACKEND - GIT OPERATIONS SCRIPT
# =============================================================================
# Handles Git operations, branch management, and version control workflows
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
readonly GIT="🔧"

# Logging functions
log_info() { echo -e "${BLUE}${INFO} $1${NC}"; }
log_success() { echo -e "${GREEN}${CHECK} $1${NC}"; }
log_warning() { echo -e "${YELLOW}${WARNING} $1${NC}"; }
log_error() { echo -e "${RED}${CROSS} $1${NC}"; }

# =============================================================================
# UTILITY FUNCTIONS
# =============================================================================

check_git() {
    if ! command -v git &> /dev/null; then
        log_error "Git is not installed"
        exit 1
    fi
    
    if ! git rev-parse --git-dir &> /dev/null; then
        log_error "Not a Git repository"
        exit 1
    fi
}

get_current_branch() {
    git branch --show-current 2>/dev/null || git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown"
}

get_default_branch() {
    git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's@^refs/remotes/origin/@@' || echo "main"
}

has_uncommitted_changes() {
    ! git diff-index --quiet HEAD -- 2>/dev/null
}

has_untracked_files() {
    [[ -n "$(git ls-files --others --exclude-standard)" ]]
}

is_branch_ahead() {
    local branch="${1:-$(get_current_branch)}"
    local upstream
    upstream=$(git rev-parse --abbrev-ref "$branch@{upstream}" 2>/dev/null || echo "")
    
    if [[ -n "$upstream" ]]; then
        local ahead
        ahead=$(git rev-list --count "$upstream..$branch" 2>/dev/null || echo "0")
        [[ "$ahead" -gt 0 ]]
    else
        false
    fi
}

is_branch_behind() {
    local branch="${1:-$(get_current_branch)}"
    local upstream
    upstream=$(git rev-parse --abbrev-ref "$branch@{upstream}" 2>/dev/null || echo "")
    
    if [[ -n "$upstream" ]]; then
        local behind
        behind=$(git rev-list --count "$branch..$upstream" 2>/dev/null || echo "0")
        [[ "$behind" -gt 0 ]]
    else
        false
    fi
}

# =============================================================================
# REPOSITORY STATUS
# =============================================================================

show_git_status() {
    log_info "Git Repository Status"
    echo
    
    # Basic repository info
    echo "Repository Information:"
    echo "  Path: $(pwd)"
    echo "  Branch: $(get_current_branch)"
    echo "  Default Branch: $(get_default_branch)"
    echo "  Remote: $(git remote get-url origin 2>/dev/null || echo "No remote configured")"
    echo
    
    # Commit information
    echo "Recent Commits:"
    git log --oneline -5 2>/dev/null || echo "  No commits found"
    echo
    
    # Working directory status
    echo "Working Directory:"
    if has_uncommitted_changes; then
        echo "  ⚠️  Uncommitted changes detected"
    else
        echo "  ✅ Working directory clean"
    fi
    
    if has_untracked_files; then
        echo "  ⚠️  Untracked files present"
    else
        echo "  ✅ No untracked files"
    fi
    echo
    
    # Branch status
    local current_branch
    current_branch=$(get_current_branch)
    echo "Branch Status:"
    
    if is_branch_ahead "$current_branch"; then
        echo "  📤 Branch is ahead of upstream"
    fi
    
    if is_branch_behind "$current_branch"; then
        echo "  📥 Branch is behind upstream"
    fi
    
    if ! is_branch_ahead "$current_branch" && ! is_branch_behind "$current_branch"; then
        echo "  ✅ Branch is up to date"
    fi
    echo
    
    # Show detailed status
    echo "Detailed Status:"
    git status --porcelain 2>/dev/null | head -10 || echo "  No changes"
}

show_branch_info() {
    log_info "Branch Information"
    echo
    
    echo "All Branches:"
    git branch -a --format="%(if)%(HEAD)%(then)* %(else)  %(end)%(refname:short)%(if)%(upstream)%(then) -> %(upstream:short)%(end)" 2>/dev/null
    echo
    
    echo "Recent Branches:"
    git for-each-ref --sort=-committerdate refs/heads/ --format="  %(refname:short) (%(committerdate:relative))" | head -5 2>/dev/null
}

# =============================================================================
# BRANCH MANAGEMENT
# =============================================================================

create_branch() {
    local branch_name="$1"
    local base_branch="${2:-$(get_default_branch)}"
    
    if [[ -z "$branch_name" ]]; then
        echo -n "Enter branch name: "
        read -r branch_name
    fi
    
    if [[ -z "$branch_name" ]]; then
        log_error "Branch name is required"
        exit 1
    fi
    
    # Validate branch name
    if ! git check-ref-format --branch "$branch_name" &>/dev/null; then
        log_error "Invalid branch name: $branch_name"
        exit 1
    fi
    
    # Check if branch already exists
    if git show-ref --verify --quiet "refs/heads/$branch_name"; then
        log_error "Branch '$branch_name' already exists"
        exit 1
    fi
    
    log_info "Creating branch '$branch_name' from '$base_branch'..."
    
    # Fetch latest changes
    git fetch origin
    
    # Create and checkout new branch
    git checkout -b "$branch_name" "origin/$base_branch"
    
    log_success "Branch '$branch_name' created and checked out"
}

switch_branch() {
    local branch_name="$1"
    
    if [[ -z "$branch_name" ]]; then
        echo "Available branches:"
        git branch --format="  %(refname:short)"
        echo
        echo -n "Enter branch name: "
        read -r branch_name
    fi
    
    if [[ -z "$branch_name" ]]; then
        log_error "Branch name is required"
        exit 1
    fi
    
    # Check for uncommitted changes
    if has_uncommitted_changes; then
        log_warning "You have uncommitted changes"
        echo -n "Stash changes and continue? (y/N): "
        read -r stash_changes
        if [[ "$stash_changes" == "y" || "$stash_changes" == "Y" ]]; then
            git stash push -m "Auto-stash before branch switch"
            log_info "Changes stashed"
        else
            log_error "Cannot switch branches with uncommitted changes"
            exit 1
        fi
    fi
    
    # Switch branch
    if git show-ref --verify --quiet "refs/heads/$branch_name"; then
        git checkout "$branch_name"
    elif git show-ref --verify --quiet "refs/remotes/origin/$branch_name"; then
        git checkout -b "$branch_name" "origin/$branch_name"
    else
        log_error "Branch '$branch_name' not found"
        exit 1
    fi
    
    log_success "Switched to branch '$branch_name'"
}

delete_branch() {
    local branch_name="$1"
    local force="${2:-false}"
    
    if [[ -z "$branch_name" ]]; then
        echo "Local branches:"
        git branch --format="  %(refname:short)" | grep -v "$(get_current_branch)"
        echo
        echo -n "Enter branch name to delete: "
        read -r branch_name
    fi
    
    if [[ -z "$branch_name" ]]; then
        log_error "Branch name is required"
        exit 1
    fi
    
    # Check if trying to delete current branch
    if [[ "$branch_name" == "$(get_current_branch)" ]]; then
        log_error "Cannot delete the currently checked out branch"
        exit 1
    fi
    
    # Check if trying to delete default branch
    if [[ "$branch_name" == "$(get_default_branch)" ]]; then
        log_error "Cannot delete the default branch"
        exit 1
    fi
    
    if [[ "$force" == "true" ]]; then
        git branch -D "$branch_name"
    else
        git branch -d "$branch_name"
    fi
    
    log_success "Branch '$branch_name' deleted"
}

clean_merged_branches() {
    log_info "Cleaning up merged branches..."
    
    local default_branch
    default_branch=$(get_default_branch)
    
    # Get merged branches (excluding current and default)
    local merged_branches
    merged_branches=$(git branch --merged "$default_branch" --format="%(refname:short)" | grep -v -E "^($default_branch|$(get_current_branch))$" || true)
    
    if [[ -z "$merged_branches" ]]; then
        log_info "No merged branches to clean up"
        return 0
    fi
    
    echo "Merged branches to delete:"
    echo "$merged_branches" | sed 's/^/  /'
    echo
    
    if [[ "${FORCE:-false}" != "true" ]]; then
        echo -n "Delete these branches? (y/N): "
        read -r confirm
        if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
            log_info "Branch cleanup cancelled"
            return 0
        fi
    fi
    
    echo "$merged_branches" | while read -r branch; do
        if [[ -n "$branch" ]]; then
            git branch -d "$branch"
            log_success "Deleted branch: $branch"
        fi
    done
}

# =============================================================================
# COMMIT OPERATIONS
# =============================================================================

smart_commit() {
    local message="$1"
    local stage_all="${2:-false}"
    
    # Check for changes
    if ! has_uncommitted_changes && ! has_untracked_files; then
        log_warning "No changes to commit"
        return 0
    fi
    
    # Stage files
    if [[ "$stage_all" == "true" ]]; then
        git add .
        log_info "All files staged"
    else
        # Show status and ask what to stage
        echo "Changes to be committed:"
        git status --porcelain
        echo
        echo -n "Stage all files? (y/N): "
        read -r stage_response
        if [[ "$stage_response" == "y" || "$stage_response" == "Y" ]]; then
            git add .
        else
            log_info "Use 'git add <file>' to stage specific files"
            return 0
        fi
    fi
    
    # Get commit message
    if [[ -z "$message" ]]; then
        echo -n "Enter commit message: "
        read -r message
    fi
    
    if [[ -z "$message" ]]; then
        log_error "Commit message is required"
        exit 1
    fi
    
    # Commit
    git commit -m "$message"
    log_success "Changes committed: $message"
}

quick_save() {
    local timestamp
    timestamp=$(date "+%Y-%m-%d %H:%M:%S")
    smart_commit "Quick save: $timestamp" "true"
}

amend_commit() {
    local new_message="$1"
    
    if [[ -z "$new_message" ]]; then
        git commit --amend
    else
        git commit --amend -m "$new_message"
    fi
    
    log_success "Last commit amended"
}

# =============================================================================
# REMOTE OPERATIONS
# =============================================================================

sync_with_remote() {
    local branch="${1:-$(get_current_branch)}"
    
    log_info "Syncing branch '$branch' with remote..."
    
    # Fetch latest changes
    git fetch origin
    
    # Check if remote branch exists
    if ! git show-ref --verify --quiet "refs/remotes/origin/$branch"; then
        log_warning "Remote branch 'origin/$branch' does not exist"
        echo -n "Push local branch to remote? (y/N): "
        read -r push_branch
        if [[ "$push_branch" == "y" || "$push_branch" == "Y" ]]; then
            git push -u origin "$branch"
            log_success "Branch pushed to remote"
        fi
        return 0
    fi
    
    # Check for conflicts
    local merge_base
    merge_base=$(git merge-base "$branch" "origin/$branch")
    local local_commit
    local_commit=$(git rev-parse "$branch")
    local remote_commit
    remote_commit=$(git rev-parse "origin/$branch")
    
    if [[ "$local_commit" == "$remote_commit" ]]; then
        log_success "Branch is up to date"
        return 0
    fi
    
    if [[ "$merge_base" == "$remote_commit" ]]; then
        # Local is ahead
        log_info "Local branch is ahead. Pushing changes..."
        git push origin "$branch"
        log_success "Changes pushed to remote"
    elif [[ "$merge_base" == "$local_commit" ]]; then
        # Remote is ahead
        log_info "Remote branch is ahead. Pulling changes..."
        git pull origin "$branch"
        log_success "Changes pulled from remote"
    else
        # Diverged
        log_warning "Branches have diverged"
        echo -n "Rebase local changes on top of remote? (y/N): "
        read -r rebase_response
        if [[ "$rebase_response" == "y" || "$rebase_response" == "Y" ]]; then
            git pull --rebase origin "$branch"
            log_success "Branch rebased and synced"
        else
            log_info "Manual merge required"
        fi
    fi
}

push_branch() {
    local branch="${1:-$(get_current_branch)}"
    local force="${2:-false}"
    
    if [[ "$force" == "true" ]]; then
        git push --force-with-lease origin "$branch"
        log_success "Branch force-pushed to remote"
    else
        git push origin "$branch"
        log_success "Branch pushed to remote"
    fi
}

# =============================================================================
# RELEASE MANAGEMENT
# =============================================================================

create_release() {
    local version="$1"
    local branch="${2:-$(get_default_branch)}"
    
    if [[ -z "$version" ]]; then
        echo -n "Enter version (e.g., v1.0.0): "
        read -r version
    fi
    
    if [[ -z "$version" ]]; then
        log_error "Version is required"
        exit 1
    fi
    
    # Add 'v' prefix if not present
    if [[ ! "$version" =~ ^v ]]; then
        version="v$version"
    fi
    
    log_info "Creating release $version from branch $branch..."
    
    # Switch to release branch
    git checkout "$branch"
    git pull origin "$branch"
    
    # Create tag
    git tag -a "$version" -m "Release $version"
    
    # Push tag
    git push origin "$version"
    
    log_success "Release $version created and pushed"
}

list_releases() {
    log_info "Available releases:"
    git tag -l --sort=-version:refname | head -10 || echo "No releases found"
}

# =============================================================================
# WORKFLOW HELPERS
# =============================================================================

setup_git_config() {
    log_info "Setting up Git configuration..."
    
    # Check if user is configured
    if ! git config user.name &>/dev/null; then
        echo -n "Enter your name: "
        read -r name
        git config user.name "$name"
    fi
    
    if ! git config user.email &>/dev/null; then
        echo -n "Enter your email: "
        read -r email
        git config user.email "$email"
    fi
    
    # Set useful configurations
    git config init.defaultBranch main
    git config push.default simple
    git config pull.rebase false
    git config core.autocrlf input
    git config core.editor "${EDITOR:-vim}"
    
    log_success "Git configuration updated"
}

create_gitignore() {
    local gitignore_file="$PROJECT_ROOT/.gitignore"
    
    if [[ -f "$gitignore_file" ]]; then
        log_warning ".gitignore already exists"
        return 0
    fi
    
    log_info "Creating .gitignore..."
    
    cat > "$gitignore_file" << 'EOF'
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
share/python-wheels/
*.egg-info/
.installed.cfg
*.egg
MANIFEST

# Django
*.log
local_settings.py
db.sqlite3
db.sqlite3-journal
media/

# Virtual Environment
venv/
env/
ENV/
env.bak/
venv.bak/

# IDEs
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Environment variables
.env
.env.local
.env.production

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Coverage reports
htmlcov/
.tox/
.coverage
.coverage.*
.cache
nosetests.xml
coverage.xml
*.cover
*.py,cover
.hypothesis/
.pytest_cache/

# Node modules (if any)
node_modules/

# Backup files
*.bak
*.backup
backups/

# Temporary files
tmp/
temp/
*.tmp

# SSL certificates
*.pem
*.key
*.crt

# Docker
.dockerignore
docker-compose.override.yml
EOF
    
    log_success ".gitignore created"
}

# =============================================================================
# MAIN FUNCTIONS
# =============================================================================

show_help() {
    echo "Watch Party Git Operations Script"
    echo
    echo "USAGE:"
    echo "  $0 [COMMAND] [OPTIONS]"
    echo
    echo "STATUS COMMANDS:"
    echo "  status             Show detailed Git status"
    echo "  branches           Show branch information"
    echo "  log [n]            Show commit history (default: 10)"
    echo
    echo "BRANCH COMMANDS:"
    echo "  create <name>      Create new branch"
    echo "  switch <name>      Switch to branch"
    echo "  delete <name>      Delete branch"
    echo "  clean              Clean up merged branches"
    echo
    echo "COMMIT COMMANDS:"
    echo "  commit [message]   Smart commit with staging"
    echo "  save               Quick save with timestamp"
    echo "  amend [message]    Amend last commit"
    echo
    echo "REMOTE COMMANDS:"
    echo "  sync               Sync current branch with remote"
    echo "  push               Push current branch"
    echo "  pull               Pull latest changes"
    echo "  fetch              Fetch from remote without merging"
    echo
    echo "RELEASE COMMANDS:"
    echo "  release <version>  Create release tag"
    echo "  releases           List available releases"
    echo
    echo "SETUP COMMANDS:"
    echo "  init               Initialize Git repository"
    echo "  setup              Setup Git configuration"
    echo "  gitignore          Create .gitignore file"
    echo
    echo "EXAMPLES:"
    echo "  $0 create feature/new-feature    # Create feature branch"
    echo "  $0 commit \"Add new feature\"      # Commit with message"
    echo "  $0 sync                          # Sync with remote"
    echo "  $0 release v1.0.0                # Create release"
}

main() {
    local command="${1:-help}"
    shift || true
    
    # Initialize git if needed for init command
    if [[ "$command" != "init" && "$command" != "help" ]]; then
        check_git
    fi
    
    case "$command" in
        status|st)
            show_git_status
            ;;
        branches|br)
            show_branch_info
            ;;
        log)
            local count="${1:-10}"
            git log --oneline -"$count"
            ;;
        create|new)
            create_branch "$@"
            ;;
        switch|checkout|co)
            switch_branch "$1"
            ;;
        delete|rm)
            delete_branch "$1" "$2"
            ;;
        clean|cleanup)
            clean_merged_branches
            ;;
        commit|ci)
            smart_commit "$1" "false"
            ;;
        save|quick)
            quick_save
            ;;
        amend)
            amend_commit "$1"
            ;;
        sync)
            sync_with_remote "$1"
            ;;
        push)
            push_branch "$1" "$2"
            ;;
        pull)
            git pull
            ;;
        fetch)
            git fetch
            ;;
        release|tag)
            create_release "$1" "$2"
            ;;
        releases|tags)
            list_releases
            ;;
        init)
            git init
            create_gitignore
            setup_git_config
            ;;
        setup|config)
            setup_git_config
            ;;
        gitignore)
            create_gitignore
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
