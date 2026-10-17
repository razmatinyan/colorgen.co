import { formatValue, scaleVariableLines, type ExportModel, type ExportScale, type ValueFormat } from './model'

export function toTailwindCss(model: ExportModel, format: ValueFormat = 'oklch') {
	return [
		'@theme {',
		...scaleVariableLines(model.scales, 'color-', format),
		'}',
		'',
		':root {',
		...model.tokens.map(token => `  --${token.name}: ${formatValue(token.light, format)};`),
		'}',
		'',
		'.dark {',
		...model.tokens.map(token => `  --${token.name}: ${formatValue(token.dark, format)};`),
		'}',
		'',
		'@theme inline {',
		...model.tokens.map(token => `  --color-${token.name}: var(--${token.name});`),
		'}',
		'',
	].join('\n')
}

export function toTailwindScales(scales: readonly ExportScale[], format: ValueFormat = 'oklch') {
	return ['@theme {', ...scaleVariableLines(scales, 'color-', format), '}', ''].join('\n')
}
