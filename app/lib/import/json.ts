import type { TokenMode } from '../color'
import { toImportName } from './names'
import type { ImportedColor, ParsedImport, SkippedValue } from './types'
import { parseImportValue } from './value'

interface JsonToken {
	path: string[]
	value: unknown
	type: string | undefined
}

const modeSegment = /^(light|dark)(?:[-_ ]?(?:mode|theme))?$/i
const aliasPattern = /^\{([^{}]+)\}$/
const maxAliasDepth = 16

function collectTokens(data: unknown) {
	const tokens = new Map<string, JsonToken>()

	function walk(node: unknown, path: string[], inheritedType: string | undefined) {
		if (typeof node === 'string') {
			if (path.length) tokens.set(path.join('.'), { path, value: node, type: inheritedType })
			return
		}
		if (!node || typeof node !== 'object' || Array.isArray(node)) return
		const record = node as Record<string, unknown>
		const legacyType = 'value' in record && typeof record.type === 'string' ? record.type : undefined
		const type = typeof record.$type === 'string' ? record.$type : (legacyType ?? inheritedType)
		if ('$value' in record || (legacyType !== undefined && 'value' in record)) {
			tokens.set(path.join('.'), { path, value: '$value' in record ? record.$value : record.value, type })
			return
		}
		for (const [key, child] of Object.entries(record)) {
			if (!key.startsWith('$')) walk(child, [...path, key], type)
		}
	}

	walk(data, [], undefined)
	return tokens
}

function resolveAlias(value: unknown, tokens: ReadonlyMap<string, JsonToken>) {
	let current = value
	for (let depth = 0; depth < maxAliasDepth; depth++) {
		const alias = typeof current === 'string' ? aliasPattern.exec(current.trim()) : null
		if (!alias) return { value: current, missing: false }
		const target = tokens.get(alias[1]!)
		if (!target) return { value: undefined, missing: true }
		current = target.value
	}
	return { value: undefined, missing: true }
}

export function parseJsonTokens(text: string, fileName?: string): ParsedImport | null {
	let data: unknown
	try {
		data = JSON.parse(text)
	} catch {
		return null
	}
	if (!data || typeof data !== 'object' || Array.isArray(data)) return null

	const fileMode: TokenMode = fileName && /dark/i.test(fileName) ? 'dark' : 'light'
	const tokens = collectTokens(data)
	const colors: ImportedColor[] = []
	const skipped: SkippedValue[] = []

	for (const token of tokens.values()) {
		if (token.type !== undefined && token.type !== 'color') continue
		const source = token.path.join('.')
		const { value, missing } = resolveAlias(token.value, tokens)
		const parsed = missing ? null : parseImportValue(value)
		if (!parsed) {
			if (missing || token.type === 'color') {
				skipped.push({ source, reason: missing ? 'missing-reference' : 'unreadable' })
			}
			continue
		}
		const modeName = token.path.find((segment) => modeSegment.test(segment))
		const mode = modeName ? (modeSegment.exec(modeName)![1]!.toLowerCase() as TokenMode) : fileMode
		const name = toImportName(token.path.filter((segment) => segment !== modeName).join('-'))
		if (name) colors.push({ name, mode, source, ...parsed })
	}
	return { colors, skipped }
}
