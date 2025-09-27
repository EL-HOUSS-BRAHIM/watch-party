import fs from 'fs'
import path from 'path'

const repoRoot = process.cwd()

function readJSON(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

function collectBackendPaths(obj, paths = new Set()) {
  if (Array.isArray(obj)) {
    obj.forEach(item => collectBackendPaths(item, paths))
    return paths
  }

  if (obj && typeof obj === 'object') {
    if (typeof obj.path === 'string') {
      paths.add(obj.path)
    }
    for (const value of Object.values(obj)) {
      collectBackendPaths(value, paths)
    }
  }

  return paths
}

function toRegexPattern(pathTemplate) {
  if (typeof pathTemplate !== 'string') return null
  if (!pathTemplate.startsWith('/')) return null

  // Remove multiple slashes and trailing whitespace
  let normalized = pathTemplate.trim()

  // Replace placeholders like <id> with a regex fragment
  normalized = normalized.replace(/<[^>]+>/g, '[^/]+')

  // Many endpoints end with a trailing slash. Allow optional trailing slash when comparing
  if (normalized.endsWith('/')) {
    normalized = normalized.slice(0, -1)
  }

  // Escape slashes for regex and allow optional trailing slash
  const escaped = normalized.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`^${escaped}(?:/)?$`)
}

function buildBackendRegexes(paths) {
  const regexes = []
  for (const p of paths) {
    const pattern = toRegexPattern(p)
    if (pattern) {
      regexes.push({ raw: p, pattern })
    }
  }
  return regexes
}

function walkFiles(dir, extensions, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    if (entry.name.startsWith('.git')) continue
    if (entry.name === 'node_modules') continue
    if (entry.isDirectory()) {
      walkFiles(path.join(dir, entry.name), extensions, files)
    } else {
      const ext = path.extname(entry.name)
      if (extensions.has(ext)) {
        files.push(path.join(dir, entry.name))
      }
    }
  }
  return files
}

function extractApiStrings(content) {
  const matches = []
  const regex = /(\"|\'|\`)\/api\/[^\"\'\`]*/g
  let match
  while ((match = regex.exec(content)) !== null) {
    const quote = match[1]
    let value = match[0]
    // Remove surrounding quote/backtick
    value = value.substring(1)

    // Handle template literals by replacing ${...} with placeholder
    value = value.replace(/\$\{[^}]+\}/g, '<param>')

    // Strip query parameters for matching
    const queryIndex = value.indexOf('?')
    if (queryIndex !== -1) {
      value = value.slice(0, queryIndex)
    }

    // Remove trailing whitespace or template expressions markers
    value = value.trim()

    matches.push(value)
  }
  return matches
}

function isMatch(value, regexes) {
  return regexes.some(({ pattern }) => pattern.test(value))
}

const backendSpec = readJSON(path.join(repoRoot, 'backend-api.json'))
const backendPaths = collectBackendPaths(backendSpec)
const backendRegexes = buildBackendRegexes(backendPaths)

const exts = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'])
const ignoredFiles = new Set([
  path.join(repoRoot, 'lib/api/endpoints.ts'),
])
const files = walkFiles(repoRoot, exts)
const invalidUsages = new Map()

for (const file of files) {
  if (ignoredFiles.has(file)) continue
  const content = fs.readFileSync(file, 'utf8')
  const apiStrings = extractApiStrings(content)
  for (const value of apiStrings) {
    if (!isMatch(value, backendRegexes)) {
      if (!invalidUsages.has(file)) {
        invalidUsages.set(file, new Set())
      }
      invalidUsages.get(file).add(value)
    }
  }
}

if (invalidUsages.size === 0) {
  console.log('All API endpoint usages match the backend specification.')
  process.exit(0)
}

console.log('Found API usages not covered by backend specification:')
for (const [file, values] of invalidUsages.entries()) {
  console.log(`\n${path.relative(repoRoot, file)}`)
  for (const value of values) {
    console.log(`  - ${value}`)
  }
}

process.exit(1)
