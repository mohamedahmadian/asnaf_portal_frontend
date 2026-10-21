import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const sourceRoot = path.resolve(rootDir, '../frontend')
const vendorRoot = path.resolve(rootDir, 'vendor/asnaf-frontend')

const entryFiles = [
  'src/components/ui/AmountInput.tsx',
  'src/components/ui/DateText.tsx',
  'src/components/ui/FileDropField.tsx',
  'src/components/ui/Form.tsx',
  'src/components/ui/FormLayout.tsx',
  'src/components/ui/LoadingState.tsx',
  'src/components/ui/PersianDateField.tsx',
  'src/components/ui/confirmToast.tsx',
  'src/lib/datetime.ts',
  'src/lib/national-id.ts',
  'src/lib/optimize-image.ts',
  'src/pages/cases/ActivityLicenseSheet.tsx',
  'src/pages/cases/AuctionWizard.tsx',
  'src/pages/cases/CaseIdentityFields.tsx',
  'src/pages/cases/CaseLocationStep.tsx',
  'src/pages/cases/InquiryDateBadges.tsx',
  'src/pages/cases/IssuedActivityLicense.tsx',
  'src/pages/cases/activity-license-styles.ts',
  'src/pages/cases/activity-license.ts',
  'src/pages/cases/auction.ts',
  'src/pages/cases/formation-types.ts',
  'src/pages/cases/inquiry-letter-print.ts',
  'src/pages/cases/inquiry-types.ts',
  'src/types/app.ts',
]

const importRe =
  /(?:import|export)\s+(?:type\s+)?(?:[^'"\n]+from\s+)?['"](\.[^'"]+)['"]|import\s*\(\s*['"](\.[^'"]+)['"]\s*\)/g

function stripQuery(spec) {
  return spec.split('?')[0]
}

function resolveLocal(fromFile, spec) {
  const clean = stripQuery(spec)
  const base = path.resolve(path.dirname(fromFile), clean)
  const candidates = [
    base,
    `${base}.ts`,
    `${base}.tsx`,
    `${base}.js`,
    `${base}.jsx`,
    `${base}.css`,
    path.join(base, 'index.ts'),
    path.join(base, 'index.tsx'),
  ]
  return candidates.find((file) => fs.existsSync(file) && fs.statSync(file).isFile()) ?? null
}

function collect(startRel) {
  const seen = new Set()
  const queue = [startRel]

  while (queue.length) {
    const rel = queue.pop()
    if (seen.has(rel)) continue
    const abs = path.join(sourceRoot, rel)
    if (!fs.existsSync(abs)) {
      throw new Error(`Missing shared frontend file: ${rel}`)
    }
    seen.add(rel)
    if (!/\.(ts|tsx|js|jsx|css)$/.test(abs)) continue

    const text = fs.readFileSync(abs, 'utf8')
    for (const match of text.matchAll(importRe)) {
      const spec = match[1] ?? match[2]
      if (!spec?.startsWith('.')) continue
      const resolved = resolveLocal(abs, spec)
      if (!resolved) {
        throw new Error(`Unresolved import ${spec} from ${rel}`)
      }
      queue.push(path.relative(sourceRoot, resolved).replaceAll('\\', '/'))
    }
  }

  return seen
}

function copyFile(rel) {
  const from = path.join(sourceRoot, rel)
  const to = path.join(vendorRoot, rel)
  fs.mkdirSync(path.dirname(to), { recursive: true })
  fs.copyFileSync(from, to)
}

function copyPublic() {
  const fromPublic = path.join(sourceRoot, 'public')
  const toPublic = path.join(vendorRoot, 'public')
  if (!fs.existsSync(fromPublic)) return
  fs.cpSync(fromPublic, toPublic, { recursive: true })
}

if (!fs.existsSync(path.join(sourceRoot, 'src'))) {
  throw new Error(`Admin frontend not found at ${sourceRoot}`)
}

fs.rmSync(vendorRoot, { recursive: true, force: true })

const files = new Set()
for (const entry of entryFiles) {
  for (const file of collect(entry)) files.add(file)
}

for (const file of [...files].sort()) copyFile(file)
copyPublic()

console.log(`Synced ${files.size} source files plus public assets to vendor/asnaf-frontend`)
