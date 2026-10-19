import { describe, expect, it } from 'vitest'
import { highlightCode, highlightLine, type HighlightedLine } from './highlight'

function text(line: HighlightedLine) {
	return line.map((token) => token.text).join('')
}

function kinds(line: HighlightedLine) {
	return line
		.filter((token) => token.kind !== 'plain')
		.flatMap((token) => [...(token.swatch ? [['swatch', token.swatch]] : []), [token.kind, token.text]])
}

describe('highlightLine', () => {
	it('keeps the original text', () => {
		const lines = [
			'  --color-brand-500: oklch(0.5523 0.1321 247.4);',
			'.gradient {',
			'  background: linear-gradient(90deg in oklch, #1f6cb0 0%, #facc15);',
			'@theme inline {',
			'  "$value": "{color.brand.500}",',
		]
		for (const line of lines) {
			expect(text(highlightLine(line, 'css'))).toBe(line)
			expect(text(highlightLine(line, 'json'))).toBe(line)
			expect(text(highlightLine(line, 'text'))).toBe(line)
		}
	})

	it('highlights a CSS declaration with a swatch before the color', () => {
		expect(kinds(highlightLine('  --primary: oklch(0.5523 0.1321 247.4);', 'css'))).toEqual([
			['property', '--primary'],
			['punctuation', ':'],
			['swatch', '#1f77bb'],
			['function', 'oklch'],
			['punctuation', '('],
			['number', '0.5523'],
			['number', '0.1321'],
			['number', '247.4'],
			['punctuation', ');'],
		])
	})

	it('highlights selectors, at-rules and references', () => {
		expect(kinds(highlightLine(':root {', 'css'))).toEqual([
			['keyword', ':root'],
			['punctuation', '{'],
		])
		expect(kinds(highlightLine('@theme inline {', 'css'))).toEqual([
			['keyword', '@theme'],
			['keyword', 'inline'],
			['punctuation', '{'],
		])
		expect(kinds(highlightLine('  --ring: var(--brand-500);', 'css'))).toEqual([
			['property', '--ring'],
			['punctuation', ':'],
			['function', 'var'],
			['punctuation', '('],
			['property', '--brand-500'],
			['punctuation', ');'],
		])
	})

	it('highlights plain properties, units and hex colors in CSS', () => {
		expect(kinds(highlightLine('  background: linear-gradient(90deg in oklch, #1f6cb0 0%);', 'css'))).toEqual([
			['property', 'background'],
			['punctuation', ':'],
			['function', 'linear-gradient'],
			['punctuation', '('],
			['number', '90deg'],
			['keyword', 'in'],
			['keyword', 'oklch'],
			['punctuation', ','],
			['swatch', '#1f6cb0'],
			['number', '#1f6cb0'],
			['number', '0%'],
			['punctuation', ');'],
		])
	})

	it('highlights JSON keys, strings, numbers and literals', () => {
		expect(kinds(highlightLine('  "hex": "#1f6cb0",', 'json'))).toEqual([
			['property', '"hex"'],
			['punctuation', ':'],
			['swatch', '#1f6cb0'],
			['string', '"#1f6cb0"'],
			['punctuation', ','],
		])
		expect(kinds(highlightLine('"components": [0.5, -1.2e-3], "alpha": 1, "on": true', 'json'))).toEqual([
			['property', '"components"'],
			['punctuation', ':'],
			['punctuation', '['],
			['number', '0.5'],
			['punctuation', ','],
			['number', '-1.2e-3'],
			['punctuation', '],'],
			['property', '"alpha"'],
			['punctuation', ':'],
			['number', '1'],
			['punctuation', ','],
			['property', '"on"'],
			['punctuation', ':'],
			['keyword', 'true'],
		])
	})

	it('adds swatches to Tailwind classes', () => {
		expect(kinds(highlightLine('bg-linear-90/oklch from-[#1f6cb0] to-[#facc15]', 'text'))).toEqual([
			['keyword', 'bg-linear-90'],
			['punctuation', '/'],
			['keyword', 'oklch'],
			['keyword', 'from-'],
			['punctuation', '['],
			['swatch', '#1f6cb0'],
			['number', '#1f6cb0'],
			['punctuation', ']'],
			['keyword', 'to-'],
			['punctuation', '['],
			['swatch', '#facc15'],
			['number', '#facc15'],
			['punctuation', ']'],
		])
	})

	it('skips swatches for values that are not colors', () => {
		expect(kinds(highlightLine('  "$value": "{color.brand.500}"', 'json'))).toEqual([
			['property', '"$value"'],
			['punctuation', ':'],
			['string', '"{color.brand.500}"'],
		])
		expect(highlightLine('  --x: oklch(oops', 'css').some((token) => token.swatch)).toBe(false)
	})

	it('returns no tokens for an empty line', () => {
		expect(highlightLine('', 'css')).toEqual([])
	})
})

describe('highlightCode', () => {
	it('splits code into lines', () => {
		const lines = highlightCode(':root {\n  --a: #fff;\n}', 'css')
		expect(lines.map(text)).toEqual([':root {', '  --a: #fff;', '}'])
	})
})
