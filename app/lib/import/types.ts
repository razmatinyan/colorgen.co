import type { TokenMode } from '../color'
import type { ImportedValue } from './value'

export const importFormats = ['css', 'json', 'tailwind-config'] as const
export type ImportFormat = (typeof importFormats)[number]

export interface ImportSource {
	text: string
	fileName?: string
}

export interface ImportedColor extends ImportedValue {
	name: string
	mode: TokenMode
	source: string
}

export type SkipReason = 'missing-reference' | 'unreadable'

export interface SkippedValue {
	source: string
	reason: SkipReason
}

export interface ParsedImport {
	colors: ImportedColor[]
	skipped: SkippedValue[]
}
