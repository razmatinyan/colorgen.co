import { tokenModes, tokenNames } from '../color'
import { looksLikeCss, parseCss } from './css'
import { parseJsonTokens } from './json'
import { mapImport, type ImportResult } from './map'
import { recognizeImport } from './recognize'
import { looksLikeTailwindConfig, parseTailwindConfig } from './tailwind-config'
import type { ImportFormat, ImportSource, ParsedImport } from './types'

export * from './types'
export * from './value'
export * from './css'
export * from './json'
export * from './tailwind-config'
export * from './recognize'
export * from './map'
export * from './sample'

export const importFormatLabels: Record<ImportFormat, string> = {
	css: 'CSS variables',
	json: 'Design tokens JSON',
	'tailwind-config': 'Tailwind config',
}

export interface ImportReading {
	formats: ImportFormat[]
	colorCount: number
	tokenCount: number
	scaleNames: string[]
	hasDarkMode: boolean
	missingReferences: number
	unreadable: number
	result: ImportResult | null
}

export function readSource({ text, fileName }: ImportSource): (ParsedImport & { format: ImportFormat }) | null {
	if (!text.trim()) return null
	const json = /^\s*\{/.test(text) ? parseJsonTokens(text, fileName) : null
	if (json) return { ...json, format: 'json' }
	if (looksLikeCss(text)) return { ...parseCss(text), format: 'css' }
	if (looksLikeTailwindConfig(text)) return { ...parseTailwindConfig(text), format: 'tailwind-config' }
	return null
}

export function readImport(sources: readonly ImportSource[]): ImportReading {
	const parsed = sources.map(readSource).filter((source) => source !== null)
	const colors = parsed.flatMap((source) => source.colors)
	const skipped = new Map(parsed.flatMap((source) => source.skipped).map((entry) => [entry.source, entry.reason]))
	const recognized = recognizeImport(colors)
	const skippedReasons = [...skipped.values()]

	return {
		formats: [...new Set(parsed.map((source) => source.format))],
		colorCount: new Set(colors.map((color) => `${color.source}.${color.mode}`)).size,
		tokenCount: tokenNames.filter((name) => tokenModes.some((mode) => recognized.tokens[name]?.[mode])).length,
		scaleNames: recognized.scales.map((scale) => scale.name),
		hasDarkMode: tokenNames.some((name) => recognized.tokens[name]?.dark),
		missingReferences: skippedReasons.filter((reason) => reason === 'missing-reference').length,
		unreadable: skippedReasons.filter((reason) => reason === 'unreadable').length,
		result: colors.length ? mapImport(recognized) : null,
	}
}
