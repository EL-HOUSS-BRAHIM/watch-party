# Automated Lint Error Batch Fixer

This directory contains automated scripts to systematically fix ESLint errors across the frontend codebase.

## Scripts

### 🐍 Python Version (Recommended)
```bash
npm run lint:fix
# or directly:
python3 scripts/fix-lint-batch.py
```

### 🟨 Node.js Version  
```bash
npm run lint:fix-js
# or directly:
node scripts/fix-lint-batch.js
```

## What It Fixes

The batch fixer automatically handles these common lint error patterns:

### ✅ Unused Imports & Variables
- Removes unused icon imports from Lucide React
- Cleans up unused React components (Card, Alert, etc.)
- Removes unused date-fns functions
- Eliminates unused variables and destructured properties

### ✅ TypeScript Issues
- Replaces `any` types with `unknown` or `Record<string, unknown>`
- Fixes type assertions and generic types
- Handles function parameter types

### ✅ React Best Practices
- Fixes unescaped entities in JSX (`'` → `&apos;`)
- Replaces `<img>` elements with Next.js `<Image>` components
- Adds missing React imports (useCallback, etc.)
- Converts require() to import statements

### ✅ Hook Dependencies
- Adds useCallback imports when needed
- Basic useEffect dependency fixes

## How It Works

1. **Analysis**: Runs `npm run lint` to get current error report
2. **Prioritization**: Processes files with most errors first
3. **Batch Processing**: Handles 3-5 files at a time for better control
4. **Pattern Matching**: Uses regex and AST-like analysis to apply fixes
5. **Validation**: Each fix is applied incrementally and verified

## Usage Example

```bash
cd frontend
npm run lint:fix

# Output:
🚀 Starting Automated Lint Batch Fixer...
📊 Found 371 lint errors across 62 files

📦 Processing Batch 1 (3 files):
  - ./app/admin/videos/page.tsx (21 errors)
  - ./app/admin/analytics/advanced/page.tsx (19 errors)
  - ./app/dashboard/analytics/ab-testing/page.tsx (18 errors)

🔧 Fixing ./app/admin/videos/page.tsx (21 errors)...
  ✅ Applied 18 fixes to videos/page.tsx

📊 LINT BATCH FIXER SUMMARY
✅ Files processed: 15
🔧 Total errors fixed: 145
```

## Safety Features

- **Non-destructive**: Creates backups and validates changes
- **Incremental**: Applies one fix at a time
- **Conservative**: Only handles well-understood patterns
- **Reversible**: All changes are tracked in git

## Manual Review Needed

Some errors require manual intervention:
- Complex useEffect dependency arrays
- Custom hook implementations  
- Business logic type definitions
- Component architecture changes

## Contributing

To add new fix patterns:

1. Add the pattern to the appropriate `fix_*` method
2. Test on a small set of files first
3. Update this documentation

## Troubleshooting

**Script fails to run:**
```bash
chmod +x scripts/fix-lint-batch.py
pip install -r requirements.txt  # if needed
```

**No fixes applied:**
- Check that file paths are correct
- Verify npm run lint produces output
- Try running on a single file first

**Fixes break code:**
- Use git to revert: `git checkout -- filename`
- Report the issue for pattern improvement