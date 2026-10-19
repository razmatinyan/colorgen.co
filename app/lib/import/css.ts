import type { TokenMode } from '../color'
import { looksLikeColorName, toImportName } from './names'
import type { ImportedColor, ParsedImport, SkippedValue } from './types'
import { parseImportString } from './value'

interface Declaration {
	name: string
	value: string
	mode: TokenMode
}

const darkContext =
	/\.dark\b|\[data-(?:theme|mode|color-scheme|color-mode)\s*=\s*["']?dark|prefers-color-scheme\s*:\s*dark|\.theme-dark\b/i
const colorFunction = /#[0-9a-f]{3,8}\b|\b(?:rgba?|hsla?|hwb|oklch|oklab|lch|lab|color)\(/i
const variableReference = /var\(\s*(--[\w-]+)\s*(?:,\s*((?:[^()]|\([^()]*\))*))?\)/
const maxExpansions = 32
const blockComment = new RegExp(String.raw`/\*[\s\S]*?\*/`, 'g')

function readDeclarations(css: string): Declaration[] {
	const text = css.replace(blockComment, '')
	const declarations: Declaration[] = []
	const contexts: string[] = []
	let buffer = ''
	let parentheses = 0

	function flush() {
		const match = /^\s*(--[\w-]+)\s*:\s*([\s\S]*?)\s*$/.exec(buffer)
		if (match?.[2]) {
			const mode = contexts.some((context) => darkContext.test(context)) ? 'dark' : 'light'
			declarations.push({ name: match[1]!, value: match[2], mode })
		}
		buffer = ''
	}

	for (const char of text) {
		if (char === '(') parentheses++
		else if (char === ')') parentheses = Math.max(0, parentheses - 1)
		if (parentheses === 0 && char === '{') {
			contexts.push(buffer.trim())
			buffer = ''
		} else if (parentheses === 0 && (char === ';' || char === '}')) {
			flush()
			if (char === '}') contexts.pop()
		} else {
			buffer += char
		}
	}
	flush()
	return declarations
}

function resolveVariables(value: string, variables: ReadonlyMap<string, string>) {
	let resolved = value
	let missing = false
	for (let expansion = 0; expansion < maxExpansions; expansion++) {
		const match = variableReference.exec(resolved)
		if (!match) return { value: resolved, missing }
		const [reference, name, fallback] = match
		let replacement = variables.get(name!) ?? fallback
		if (replacement === undefined) {
			missing = true
			replacement = ''
		}
		resolved = resolved.slice(0, match.index) + replacement + resolved.slice(match.index + reference.length)
	}
	return { value: resolved, missing: true }
}

export function parseCss(text: string): ParsedImport {
	const declarations = readDeclarations(text)
	const light = new Map<string, string>()
	const darkOverrides = new Map<string, string>()
	for (const { name, value, mode } of declarations) (mode === 'light' ? light : darkOverrides).set(name, value)
	const dark = new Map([...light, ...darkOverrides])

	const colors: ImportedColor[] = []
	const skipped: SkippedValue[] = []

	function read(source: string, raw: string, mode: TokenMode, variables: ReadonlyMap<string, string>) {
		const { value, missing } = resolveVariables(raw, variables)
		const parsed = missing ? null : parseImportString(value)
		const name = toImportName(source)
		if (parsed) colors.push({ name, mode, source, ...parsed })
		else if (colorFunction.test(raw) || colorFunction.test(value) || looksLikeColorName(name)) {
			skipped.push({ source, reason: missing ? 'missing-reference' : 'unreadable' })
		}
	}

	for (const [source, raw] of light) read(source, raw, 'light', light)
	for (const [source, raw] of dark) {
		const changesInDark =
			darkOverrides.has(source) || resolveVariables(raw, dark).value !== resolveVariables(raw, light).value
		if (changesInDark) read(source, raw, 'dark', dark)
	}
	return { colors, skipped }
}

export function looksLikeCss(text: string) {
	return /--[\w-]+\s*:/.test(text)
}
