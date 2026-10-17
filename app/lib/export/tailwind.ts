import { formatValue, type ExportModel, type ValueFormat } from './model'

export function toTailwindCss(model: ExportModel, format: ValueFormat = 'oklch') {
	const scaleLines = model.scales.flatMap(scale => [
		'',
		...scale.steps.map(step => `  --color-${scale.name}-${step.step}: ${formatValue(step, format)};`),
	])
	return [
		'@theme {',
		...scaleLines.slice(1),
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
