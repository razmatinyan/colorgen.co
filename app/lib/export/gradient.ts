import { sampleGradient, toHex, toOklch, type ColorInput, type GradientSpace, type Oklch } from '../color'
import type { GradientType } from '../gradient-url'
import { formatValue, type ValueFormat } from './model'

export interface GradientExport {
	stops: readonly Oklch[]
	type: GradientType
	angle: number
	space: GradientSpace
}

const fallbackSamplesPerSegment = 8

function percent(value: number) {
	return `${Number((value * 100).toFixed(2))}%`
}

function stopValue(color: Oklch, format: ValueFormat) {
	return formatValue({ hex: toHex(color), color }, format)
}

function gradientPrelude({ type, angle }: GradientExport, interpolation: string) {
	const method = interpolation ? `in ${interpolation}` : ''
	switch (type) {
		case 'linear':
			return [`${angle}deg`, method].filter(Boolean).join(' ')
		case 'radial':
			return ['circle', method].filter(Boolean).join(' ')
		case 'conic':
			return [`from ${angle}deg`, method].filter(Boolean).join(' ')
	}
}

export function toCssGradient(gradient: GradientExport, format: ValueFormat = 'hex') {
	const interpolation = gradient.space === 'srgb' ? '' : gradient.space
	const stops = gradient.stops.map((stop) => stopValue(stop, format))
	return `${gradient.type}-gradient(${[gradientPrelude(gradient, interpolation), ...stops].join(', ')})`
}

export function toFallbackGradient(gradient: GradientExport) {
	const count = (gradient.stops.length - 1) * fallbackSamplesPerSegment + 1
	const samples = sampleGradient(gradient.stops, count, gradient.space)
	const stops = samples.map((color, index) => `${toHex(color)} ${percent(index / (count - 1))}`)
	return `${gradient.type}-gradient(${[gradientPrelude(gradient, ''), ...stops].join(', ')})`
}

export function toGradientCss(gradient: GradientExport, format: ValueFormat = 'hex', selector = '.gradient') {
	const lines =
		gradient.space === 'srgb'
			? [`  background: ${toCssGradient(gradient, format)};`]
			: [`  background: ${toFallbackGradient(gradient)};`, `  background: ${toCssGradient(gradient, format)};`]
	return [`${selector} {`, ...lines, '}', ''].join('\n')
}

const tailwindDirectStops = 3

export function toTailwindGradient(gradient: GradientExport) {
	const hexes = gradient.stops.map((stop) => toHex(stop))
	if (hexes.length > tailwindDirectStops) {
		return `bg-[${toCssGradient(gradient, 'hex').replaceAll(' ', '_')}]`
	}
	const base = {
		linear: `bg-linear-${gradient.angle}`,
		radial: 'bg-radial',
		conic: `bg-conic-${gradient.angle}`,
	}[gradient.type]
	const [from, ...rest] = hexes
	const to = rest.pop()!
	return [`${base}/${gradient.space}`, `from-[${from}]`, ...rest.map((hex) => `via-[${hex}]`), `to-[${to}]`].join(' ')
}

export function toNumberedVariables(colors: readonly ColorInput[], format: ValueFormat = 'hex', name = 'gradient') {
	return [
		':root {',
		...colors.map((color, index) => `  --${name}-${index + 1}: ${stopValue(toOklch(color), format)};`),
		'}',
		'',
	].join('\n')
}
