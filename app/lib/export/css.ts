import { formatValue, type ExportModel, type ExportTokenValue, type ValueFormat } from './model'

function reference(value: ExportTokenValue, format: ValueFormat) {
	return value.primitive ? `var(--${value.primitive.scale}-${value.primitive.step})` : formatValue(value, format)
}

export function toCssVariables(model: ExportModel, format: ValueFormat = 'oklch') {
	const scaleLines = model.scales.flatMap(scale => [
		'',
		...scale.steps.map(step => `  --${scale.name}-${step.step}: ${formatValue(step, format)};`),
	])
	const lightLines = model.tokens.map(token => `  --${token.name}: ${reference(token.light, format)};`)
	const darkLines = model.tokens.map(token => `  --${token.name}: ${reference(token.dark, format)};`)
	return [
		':root {',
		...scaleLines.slice(1),
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
