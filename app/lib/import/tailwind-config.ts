import { scaleSteps, type ScaleStep } from '../color'
import { tailwindColors } from '../sitemap-colors'
import { toImportName } from './names'
import type { ImportedColor, ParsedImport, SkippedValue } from './types'
import { parseImportString } from './value'

interface Token {
	kind: 'punctuation' | 'string' | 'word'
	value: string
}

type ConfigValue = string | ConfigObject | ConfigReference | null
interface ConfigReference {
	reference: string[]
}
interface ConfigObject {
	[key: string]: ConfigValue
}

const punctuation = new Set(['{', '}', '[', ']', '(', ')', ':', ',', '.'])
const closing: Record<string, string> = { '{': '}', '[': ']', '(': ')' }
const quotes = new Set(['"', "'", '`'])
const wordPattern = /[\w$]+/y
const fixedColors: Record<string, string> = { white: '#ffffff', black: '#000000' }

function tokenize(text: string): Token[] {
	const tokens: Token[] = []
	let index = 0
	while (index < text.length) {
		const char = text[index]!
		if (/\s/.test(char)) {
			index++
		} else if (text.startsWith('//', index)) {
			const end = text.indexOf('\n', index)
			index = end === -1 ? text.length : end
		} else if (text.startsWith('/*', index)) {
			const end = text.indexOf('*/', index + 2)
			index = end === -1 ? text.length : end + 2
		} else if (quotes.has(char)) {
			let value = ''
			index++
			while (index < text.length && text[index] !== char) {
				if (text[index] === '\\') index++
				value += text[index] ?? ''
				index++
			}
			tokens.push({ kind: 'string', value })
			index++
		} else if (text.startsWith('...', index)) {
			tokens.push({ kind: 'punctuation', value: '...' })
			index += 3
		} else if (punctuation.has(char)) {
			tokens.push({ kind: 'punctuation', value: char })
			index++
		} else {
			wordPattern.lastIndex = index
			const word = wordPattern.exec(text)
			tokens.push({ kind: word ? 'word' : 'punctuation', value: word ? word[0] : char })
			index += word ? word[0].length : 1
		}
	}
	return tokens
}

function createParser(tokens: readonly Token[], start: number) {
	let position = start
	const peek = () => tokens[position]
	const isPunctuation = (value: string) => peek()?.kind === 'punctuation' && peek()?.value === value

	function skipBalanced() {
		const open = peek()!.value
		let depth = 0
		while (position < tokens.length) {
			const token = tokens[position++]!
			if (token.kind !== 'punctuation') continue
			if (token.value === open) depth++
			else if (token.value === closing[open]) depth--
			if (depth === 0) return
		}
	}

	function skipToSeparator() {
		while (position < tokens.length && !isPunctuation(',') && !isPunctuation('}')) {
			const token = peek()!
			if (token.kind === 'punctuation' && closing[token.value]) skipBalanced()
			else position++
		}
	}

	function parseReference(): ConfigValue {
		const names = [tokens[position++]!.value]
		while (position < tokens.length) {
			if (isPunctuation('.') && tokens[position + 1]?.kind === 'word') {
				names.push(tokens[position + 1]!.value)
				position += 2
			} else if (isPunctuation('[') && tokens[position + 2]?.value === ']') {
				names.push(tokens[position + 1]!.value)
				position += 3
			} else {
				break
			}
		}
		if (isPunctuation('(')) {
			skipBalanced()
			return null
		}
		return { reference: names }
	}

	function parseValue(): ConfigValue {
		const token = peek()
		if (!token) return null
		if (token.kind === 'string') {
			position++
			return token.value
		}
		if (token.kind === 'word') return parseReference()
		if (token.value === '{') return parseObject()
		if (closing[token.value]) skipBalanced()
		else position++
		return null
	}

	function parseObject(): ConfigObject {
		const result: ConfigObject = {}
		position++
		while (position < tokens.length && !isPunctuation('}')) {
			const token = peek()!
			if (token.kind === 'punctuation') {
				if (token.value === '...') position++
				parseValue()
			} else {
				position++
				if (isPunctuation(':')) {
					position++
					result[token.value] = parseValue()
				} else {
					result[token.value] = { reference: [token.value] }
				}
			}
			skipToSeparator()
			if (isPunctuation(',')) position++
		}
		position++
		return result
	}

	return { parseObject }
}

function isTailwindFamily(name: string | undefined): name is keyof typeof tailwindColors {
	return name !== undefined && Object.hasOwn(tailwindColors, name)
}

function resolveReference(names: readonly string[]): ConfigValue {
	const last = names.at(-1)!
	const previous = names.at(-2)
	if (isTailwindFamily(previous)) {
		const index = scaleSteps.indexOf(Number(last) as ScaleStep)
		return index === -1 ? null : tailwindColors[previous][index]!
	}
	if (isTailwindFamily(last)) {
		return Object.fromEntries(scaleSteps.map((step, index) => [String(step), tailwindColors[last][index]!]))
	}
	return names.length > 1 ? (fixedColors[last] ?? null) : null
}

function isReference(value: ConfigValue): value is ConfigReference {
	return typeof value === 'object' && value !== null && Array.isArray(value.reference)
}

export function parseTailwindConfig(text: string): ParsedImport {
	const tokens = tokenize(text)
	const colors: ImportedColor[] = []
	const skipped: SkippedValue[] = []

	function add(path: readonly string[], value: string) {
		const source = ['colors', ...path].join('.')
		const parsed = parseImportString(value)
		if (parsed) colors.push({ name: toImportName(path.join('-')), mode: 'light', source, ...parsed })
		else skipped.push({ source, reason: value.includes('var(') ? 'missing-reference' : 'unreadable' })
	}

	function flatten(value: ConfigValue, path: readonly string[]) {
		if (value === null) return
		if (typeof value === 'string') {
			if (path.length) add(path, value)
		} else if (isReference(value)) {
			flatten(resolveReference(value.reference), path)
		} else {
			for (const [key, child] of Object.entries(value)) flatten(child, key === 'DEFAULT' ? path : [...path, key])
		}
	}

	tokens.forEach((token, index) => {
		const isColorsKey = token.kind !== 'punctuation' && token.value === 'colors'
		if (!isColorsKey || tokens[index + 1]?.value !== ':' || tokens[index + 2]?.value !== '{') return
		flatten(createParser(tokens, index + 2).parseObject(), [])
	})
	return { colors, skipped }
}

export function looksLikeTailwindConfig(text: string) {
	return /\bcolors['"]?\s*:\s*\{/.test(text)
}
