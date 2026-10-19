import {
	formatValue,
	scaleVariableLines,
	type ExportModel,
	type ExportScale,
	type ExportTokenValue,
	type ValueFormat,
} from './model'

function reference(value: ExportTokenValue, format: ValueFormat) {
	return value.primitive ? `var(--${value.primitive.scale}-${value.primitive.step})` : formatValue(value, format)
}

export function toCssVariables(model: ExportModel, format: ValueFormat = 'oklch') {
	const lightLines = model.tokens.map((token) => `  --${token.name}: ${reference(token.light, format)};`)
	const darkLines = model.tokens.map((token) => `  --${token.name}: ${reference(token.dark, format)};`)
	return [
		':root {',
		...scaleVariableLines(model.scales, '', format),
		'',
		...lightLines,
		'}',
		'',
		'.dark {',
		...darkLines,
		'}',
		'',
	].join('\n')
}

export function toCssScales(scales: readonly ExportScale[], format: ValueFormat = 'oklch') {
	return [':root {', ...scaleVariableLines(scales, '', format), '}', ''].join('\n')
}
