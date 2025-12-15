#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

console.log('Patching tldraw license...')

// Patch LicenseManager.ts
const licenseManagerPath = path.join(
    __dirname,
    '../node_modules/@tldraw/editor/src/lib/license/LicenseManager.ts',
)

try {
    if (!fs.existsSync(licenseManagerPath)) {
        console.error(`File not found: ${licenseManagerPath}`)
        process.exit(1)
    }

    let content = fs.readFileSync(licenseManagerPath, 'utf8')

    // Replace the getLicenseState function to always return 'licensed'
    const getLicenseStateOriginal = `export function getLicenseState(`

    if (content.includes(getLicenseStateOriginal)) {
        // Find the entire function and replace it
        const functionStart = content.indexOf(getLicenseStateOriginal)
        const functionEnd = content.indexOf('\n}', functionStart + 500) + 2
        const originalFunction = content.substring(functionStart, functionEnd)

        const patchedFunction = `export function getLicenseState(
	result: LicenseFromKeyResult,
	outputMessages: (messages: string[]) => void,
	isDevelopment: boolean
): LicenseState {
	// Patched to always return 'licensed'
	return 'licensed'
}`

        content = content.replace(originalFunction, patchedFunction)
        fs.writeFileSync(licenseManagerPath, content, 'utf8')
        console.log('✅ Successfully patched LicenseManager.ts')
    } else {
        console.warn('⚠️  getLicenseState function not found or already patched')
    }
} catch (error) {
    console.error('❌ Error patching LicenseManager.ts:', error.message)
    process.exit(1)
}

// Patch LicenseProvider.tsx
const licenseProviderPath = path.join(
    __dirname,
    '../node_modules/@tldraw/editor/src/lib/license/LicenseProvider.tsx',
)

try {
    if (!fs.existsSync(licenseProviderPath)) {
        console.error(`File not found: ${licenseProviderPath}`)
        process.exit(1)
    }

    let content = fs.readFileSync(licenseProviderPath, 'utf8')

    // Replace the shouldHideEditorAfterDelay function to always return false
    const shouldHideOriginal = `function shouldHideEditorAfterDelay(licenseState: string): boolean {
	return licenseState === 'expired' || licenseState === 'unlicensed-production'
}`

    const shouldHidePatched = `function shouldHideEditorAfterDelay(licenseState: string): boolean {
	// Patched to never hide the editor
	return false
}`

    if (content.includes(shouldHideOriginal)) {
        content = content.replace(shouldHideOriginal, shouldHidePatched)
        fs.writeFileSync(licenseProviderPath, content, 'utf8')
        console.log('✅ Successfully patched LicenseProvider.tsx')
    } else {
        console.warn('⚠️  shouldHideEditorAfterDelay function not found or already patched')
    }
} catch (error) {
    console.error('❌ Error patching LicenseProvider.tsx:', error.message)
    process.exit(1)
}

console.log('✅ License patch completed successfully!')

