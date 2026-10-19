import { parseColor, toHex } from './color'

export type CodeLanguage = 'css' | 'json' | 'text'

export type HighlightKind = 'plain' | 'punctuation' | 'keyword' | 'property' | 'string' | 'number' | 'function'

export interface HighlightToken {
	kind: HighlightKind
	text: string
	swatch?: string
}

export type HighlightedLine = HighlightToken[]

type Rule = [pattern: RegExp, kind: HighlightKind]

const hexColor = /#[0-9a-f]{3,8}\b/iy
const swatchFunctions = new Set(['oklch', 'oklab', 'lch', 'lab', 'rgb', 'rgba', 'hsl', 'hsla', 'hwb', 'color'])

const rules: Record<CodeLanguage, Rule[]> = {
	css: [
		[/\s+/y, 'plain'],
		[hexColor, 'number'],
		[/[a-z][\w-]*(?=\()/iy, 'function'],
		[/--[\w-]+/y, 'property'],
		[/@[\w-]+/y, 'keyword'],
		[/-?(?:\d+\.?\d*|\.\d+)(?:%|[a-z]+)?/iy, 'number'],
		[/[.:][a-z][\w-]*/iy, 'keyword'],
		[/[a-z][\w-]*(?=\s*:\s)/iy, 'property'],
		[/[a-z][\w-]*/iy, 'keyword'],
		[/[{}()[\];:,/]/y, 'punctuation'],
	],
	json: [
		[/\s+/y, 'plain'],
		[/"(?:[^"\\]|\\.)*"(?=\s*:)/y, 'property'],
		[/"(?:[^"\\]|\\.)*"/y, 'string'],
		[/-?\d+(?:\.\d+)?(?:e[+-]?\d+)?/iy, 'number'],
		[/\b(?:true|false|null)\b/y, 'keyword'],
		[/[{}[\],:]/y, 'punctuation'],
	],
	text: [
		[/\s+/y, 'plain'],
		[hexColor, 'number'],
		[/-?(?:\d+\.?\d*|\.\d+)(?:%|[a-z]+)?/iy, 'number'],
		[/[a-z][a-z0-9-]*/iy, 'keyword'],
		[/[[\]()_,/]/y, 'punctuation'],
	],
}

function matchAt(pattern: RegExp, line: string, index: number) {
	pattern.lastIndex = index
	return pattern.exec(line)?.[0] ?? null
}

function swatchHex(value: string) {
	const color = parseColor(value)
	return color ? toHex(color) : null
}

function swatchFor(kind: HighlightKind, text: string, line: string, end: number) {
	if (kind === 'number' && text.startsWith('#')) return swatchHex(text)
	if (kind === 'string' && /^"#[0-9a-f]{3,8}"$/i.test(text)) return swatchHex(text.slice(1, -1))
	if (kind === 'function' && swatchFunctions.has(text.toLowerCase())) {
		const close = line.indexOf(')', end)
		return close === -1 ? null : swatchHex(line.slice(end - text.length, close + 1))
	}
	return null
}

export function highlightLine(line: string, language: CodeLanguage): HighlightedLine {
	const tokens: HighlightedLine = []
	let index = 0
	while (index < line.length) {
		let kind: HighlightKind = 'plain'
		let text = line[index]!
		for (const [pattern, ruleKind] of rules[language]) {
			const match = matchAt(pattern, line, index)
			if (match) {
				kind = ruleKind
				text = match
				break
			}
		}
		const swatch = swatchFor(kind, text, line, index + text.length)
		const previous = tokens.at(-1)
		if (swatch) tokens.push({ kind, text, swatch })
		else if (previous && previous.kind === kind && !previous.swatch) previous.text += text
		else tokens.push({ kind, text })
		index += text.length
	}
	return tokens
}

export function highlightCode(code: string, language: CodeLanguage): HighlightedLine[] {
	return code.split('\n').map((line) => highlightLine(line, language))
}
