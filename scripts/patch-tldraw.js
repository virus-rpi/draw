#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

console.log('Patching tldraw license...')

function patchFile( filePath, searchPattern, replacement, description ) {
    try {
        if (!fs.existsSync(filePath)) {
            console.warn(`⚠️  File not found: ${filePath}`)
            return false
        }

        let content = fs.readFileSync(filePath, 'utf8')

        // Check if already patched
        if (content.includes('// Patched to')) {
            console.log(`⏭️  Already patched: ${description}`)
            return true
        }

        if (!searchPattern.test(content)) {
            console.warn(`⚠️  Pattern not found in ${description}`)
            return false
        }

        // Use regex with multiline and dotall flags for more robust matching
        content = content.replace(searchPattern, replacement)
        fs.writeFileSync(filePath, content, 'utf8')
        console.log(`✅ Successfully patched: ${description}`)
        return true
    } catch (error) {
        console.error(`❌ Error patching ${description}:`, error.message)
        return false
    }
}

// Patch LicenseManager.ts (source)
const licenseManagerTsPath = path.join(
    __dirname,
    '../node_modules/@tldraw/editor/src/lib/license/LicenseManager.ts',
)

const licenseManagerPatched = patchFile(
    licenseManagerTsPath,
    /export function getLicenseState\([^)]+\)[^{]+{[\s\S]*?\n}/,
    `export function getLicenseState(
\tresult: LicenseFromKeyResult,
\toutputMessages: (messages: string[]) => void,
\tisDevelopment: boolean
): LicenseState {
\t// Patched to always return 'licensed'
\treturn 'licensed'
}`,
    'LicenseManager.ts',
)

// Patch LicenseProvider.tsx (source)
const licenseProviderTsxPath = path.join(
    __dirname,
    '../node_modules/@tldraw/editor/src/lib/license/LicenseProvider.tsx',
)

const licenseProviderPatched = patchFile(
    licenseProviderTsxPath,
    /function shouldHideEditorAfterDelay\(licenseState: string\): boolean {\s+return licenseState === 'expired' \|\| licenseState === 'unlicensed-production'\s+}/,
    `function shouldHideEditorAfterDelay(licenseState: string): boolean {
\t// Patched to never hide the editor
\treturn false
}`,
    'LicenseProvider.tsx',
)

// Also patch the compiled files directly (since we can't rebuild without tsconfig)
console.log('\n🔨 Patching compiled files...')
const editorPath = path.join(__dirname, '../node_modules/@tldraw/editor')

patchFile(
    path.join(editorPath, 'dist-cjs/lib/license/LicenseManager.js'),
    /function getLicenseState\(result, outputMessages, isDevelopment\) {[\s\S]*?\n}/,
    `function getLicenseState(result, outputMessages, isDevelopment) {
  // Patched to always return 'licensed'
  return "licensed";
}`,
    'LicenseManager.js (CommonJS)',
)

patchFile(
    path.join(editorPath, 'dist-esm/lib/license/LicenseManager.mjs'),
    /function getLicenseState\(result, outputMessages, isDevelopment\) {[\s\S]*?\n}/,
    `function getLicenseState(result, outputMessages, isDevelopment) {
  // Patched to always return 'licensed'
  return "licensed";
}`,
    'LicenseManager.mjs (ESM)',
)

patchFile(
    path.join(editorPath, 'dist-cjs/lib/license/LicenseProvider.js'),
    /function shouldHideEditorAfterDelay\(licenseState\) {\s+return licenseState === "expired" \|\| licenseState === "unlicensed-production";\s+}/,
    `function shouldHideEditorAfterDelay(licenseState) {
  // Patched to never hide the editor
  return false;
}`,
    'LicenseProvider.js (CommonJS)',
)

patchFile(
    path.join(editorPath, 'dist-esm/lib/license/LicenseProvider.mjs'),
    /function shouldHideEditorAfterDelay\(licenseState\) {\s+return licenseState === "expired" \|\| licenseState === "unlicensed-production";\s+}/,
    `function shouldHideEditorAfterDelay(licenseState) {
  // Patched to never hide the editor
  return false;
}`,
    'LicenseProvider.mjs (ESM)',
)

console.log('\n✅ License patch completed successfully!')

