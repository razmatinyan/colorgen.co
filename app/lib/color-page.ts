import {
	checkContrast,
	colorFamily,
	convertColor,
	createRng,
	darkText,
	defaultNeutralTint,
	describeColor,
	findContrastFix,
	generatePalette,
	generateScale,
	generateSystem,
	harmonies,
	lightText,
	nearestStepIndex,
	normalize,
	resolveTokens,
	scaleSteps,
	systemScales,
	toGamutOklch,
	toHex,
	wcagRatio,
	wrapHue,
	type ContrastCheck,
	type ContrastFix,
	type Harmony,
	type Oklch,
	type ResolvedTokens,
	type ScaleStep,
	type ScaleSwatch,
	type SystemColorId,
} from './color'
import { parseHexPart } from './palette-url'

export type ColorPageRoute = { hex: string } | { redirect: string } | null

export function parseColorPageParam(param: string | undefined): ColorPageRoute {
	const color = parseHexPart(param)
	if (!color) return null
	const canonical = toHex(color).slice(1)
	return param === canonical ? { hex: `#${canonical}` } : { redirect: canonical }
}

export const shownFormatIds = ['hex', 'rgb', 'hsl', 'oklch'] as const

export interface ReadabilityRow {
	id: 'white-on-color' | 'dark-on-color' | 'color-on-white' | 'color-on-dark'
	label: string
	text: string
	background: string
	check: ContrastCheck
	fix: ContrastFix | null
}

export interface PaletteSuggestion {
	harmony: Harmony
	label: string
	hexes: string[]
}

export interface RelatedColor {
	id: string
	label: string
	name: string
	hex: string
}

export interface SystemPreviewScale {
	id: SystemColorId
	label: string
	anchorStep: ScaleStep | null
	swatches: ScaleSwatch[]
}

export interface ColorPage {
	hex: string
	color: Oklch
	name: string
	family: string
	intensity: 'muted' | 'moderate' | 'vivid' | 'neutral'
	cssNames: string[]
	values: { id: string, label: string, value: string }[]
	shades: ScaleSwatch[]
	anchorStep: ScaleStep
	readability: ReadabilityRow[]
	bestTextColor: string
	palettes: PaletteSuggestion[]
	related: RelatedColor[]
	system: {
		scales: SystemPreviewScale[]
		tokens: ResolvedTokens
	}
}

export const harmonyLabels: Record<Harmony, string> = {
	'analogous': 'Analogous',
	'complementary': 'Complementary',
	'split-complementary': 'Split complementary',
	'triadic': 'Triadic',
	'tetradic': 'Tetradic',
	'monochromatic': 'Monochromatic',
}

export const systemScaleLabels: Record<SystemColorId, string> = {
	brand: 'Brand',
	brand2: 'Second brand',
	neutral: 'Neutral',
	success: 'Success',
	warning: 'Warning',
	danger: 'Danger',
	info: 'Info',
}

const readableRatio = 4.5
const achromaticChroma = 0.025
const lightnessShift = 0.1

function intensityOf(color: Oklch): ColorPage['intensity'] {
	if (color.c < achromaticChroma) return 'neutral'
	if (color.c < 0.07) return 'muted'
	if (color.c < 0.14) return 'moderate'
	return 'vivid'
}

function readabilityRows(hex: string, color: Oklch): ReadabilityRow[] {
	const fixAgainst = (background: string) => (wcagRatio(hex, background) >= readableRatio ? null : findContrastFix(color, background, readableRatio))
	return [
		{ id: 'white-on-color', label: 'White text on it', text: lightText, background: hex, check: checkContrast(lightText, hex), fix: null },
		{ id: 'dark-on-color', label: 'Dark text on it', text: darkText, background: hex, check: checkContrast(darkText, hex), fix: null },
		{ id: 'color-on-white', label: 'As text on white', text: hex, background: lightText, check: checkContrast(hex, lightText), fix: fixAgainst(lightText) },
		{ id: 'color-on-dark', label: 'As text on a dark background', text: hex, background: darkText, check: checkContrast(hex, darkText), fix: fixAgainst(darkText) },
	]
}

function suggestPalettesFor(hex: string, color: Oklch): PaletteSuggestion[] {
	const seed = Number.parseInt(hex.slice(1), 16)
	return harmonies.map((harmony, index) => ({
		harmony,
		label: harmonyLabels[harmony],
		hexes: generatePalette({ rng: createRng(seed + index), harmony, locked: [color] }).map(toHex),
	}))
}

function relatedColors(hex: string, color: Oklch): RelatedColor[] {
	const variant = (id: string, label: string, next: Oklch) => {
		const mapped = normalize(toGamutOklch(next))
		return { id, label, name: describeColor(mapped), hex: toHex(mapped) }
	}
	const candidates = [
		variant('lighter', 'Lighter', { ...color, l: Math.min(0.98, color.l + lightnessShift) }),
		variant('darker', 'Darker', { ...color, l: Math.max(0.12, color.l - lightnessShift) }),
	]
	if (color.c >= achromaticChroma) {
		candidates.push(
			variant('complementary', 'Complementary', { ...color, h: wrapHue(color.h + 180) }),
			variant('analogous-before', 'Analogous', { ...color, h: wrapHue(color.h - 30) }),
			variant('analogous-after', 'Analogous', { ...color, h: wrapHue(color.h + 30) }),
			variant('triadic', 'Triadic', { ...color, h: wrapHue(color.h + 120) }),
			variant('muted', 'More muted', { ...color, c: color.c * 0.5 }),
			variant('gray', 'Tinted gray', { ...color, c: Math.min(color.c, 0.02) }),
		)
	}
	const seen = new Set([hex])
	return candidates.filter((candidate) => {
		if (seen.has(candidate.hex)) return false
		seen.add(candidate.hex)
		return true
	})
}

function systemPreview(color: Oklch): ColorPage['system'] {
	const system = generateSystem({ brand: color, brand2: null, neutralTint: defaultNeutralTint, status: {} })
	return {
		scales: systemScales(system).map(scale => ({ id: scale.id, label: systemScaleLabels[scale.id], anchorStep: scale.anchorStep, swatches: scale.swatches })),
		tokens: resolveTokens(system),
	}
}

export function buildColorPage(hex: string): ColorPage {
	const conversion = convertColor(hex)
	const color = conversion.color
	const readability = readabilityRows(conversion.hex, color)
	const [whiteOnColor, darkOnColor] = readability
	return {
		hex: conversion.hex,
		color,
		name: describeColor(color),
		family: colorFamily(color),
		intensity: intensityOf(color),
		cssNames: conversion.names,
		values: conversion.values
			.filter(value => (shownFormatIds as readonly string[]).includes(value.id))
			.map(({ id, label, value }) => ({ id, label, value })),
		shades: generateScale(color),
		anchorStep: scaleSteps[nearestStepIndex(color.l)]!,
		readability,
		bestTextColor: whiteOnColor!.check.ratio >= darkOnColor!.check.ratio ? lightText : darkText,
		palettes: suggestPalettesFor(conversion.hex, color),
		related: relatedColors(conversion.hex, color),
		system: systemPreview(color),
	}
}

const intensityWords: Record<ColorPage['intensity'], string> = {
	neutral: 'with almost no color',
	muted: 'with low intensity',
	moderate: 'with medium intensity',
	vivid: 'with high intensity',
}

function withArticle(words: string) {
	return `${/^[aeiou]/i.test(words) ? 'an' : 'a'} ${words}`
}

export function colorPageSummary(page: ColorPage) {
	const label = page.hex.toUpperCase()
	const [whiteOnColor, darkOnColor, onWhite] = page.readability
	const bestOnColor = whiteOnColor!.check.ratio >= darkOnColor!.check.ratio ? whiteOnColor! : darkOnColor!
	const textName = bestOnColor === whiteOnColor ? 'White' : 'Dark'
	const asText = onWhite!.check.ratio >= readableRatio
		? `It is readable as text on white (${onWhite!.check.ratio.toFixed(1)}:1).`
		: `On white it reaches only ${onWhite!.check.ratio.toFixed(1)}:1, so use a darker shade for text.`
	return `${label} is ${withArticle(page.name.toLowerCase())} ${intensityWords[page.intensity]}, at step ${page.anchorStep} of its 50–950 scale. ${textName} text on it has a contrast of ${bestOnColor.check.ratio.toFixed(1)}:1. ${asText}`
}

export function colorPageTitle(page: ColorPage) {
	return `${page.hex.toUpperCase()} color: ${page.name} shades, palettes and contrast`
}
