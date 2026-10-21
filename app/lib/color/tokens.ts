import { wcagRatio } from './contrast'
import { scaleSteps, type ScaleStep } from './scale'
import { systemColorIds, type ColorSystem, type SystemColorId } from './system'

export const tokenModes = ['light', 'dark'] as const
export type TokenMode = (typeof tokenModes)[number]

export const tokenGroups = [
	{
		id: 'surfaces',
		label: 'Surfaces',
		tokens: ['background', 'foreground', 'card', 'card-foreground', 'popover', 'popover-foreground'],
	},
	{
		id: 'actions',
		label: 'Actions',
		tokens: ['primary', 'primary-foreground', 'secondary', 'secondary-foreground', 'accent', 'accent-foreground'],
	},
	{ id: 'subtle', label: 'Muted, borders and focus', tokens: ['muted', 'muted-foreground', 'border', 'input', 'ring'] },
	{
		id: 'status',
		label: 'Status',
		tokens: [
			'destructive',
			'destructive-foreground',
			'success',
			'success-foreground',
			'warning',
			'warning-foreground',
			'info',
			'info-foreground',
		],
	},
	{ id: 'charts', label: 'Charts', tokens: ['chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5'] },
	{
		id: 'sidebar',
		label: 'Sidebar',
		tokens: [
			'sidebar',
			'sidebar-foreground',
			'sidebar-primary',
			'sidebar-primary-foreground',
			'sidebar-accent',
			'sidebar-accent-foreground',
			'sidebar-border',
			'sidebar-ring',
		],
	},
] as const

export type TokenName = (typeof tokenGroups)[number]['tokens'][number]
export const tokenNames: readonly TokenName[] = tokenGroups.flatMap((group) => group.tokens)

export type ScaleRef = `${SystemColorId}.${ScaleStep}`
export type TokenRef = 'white' | ScaleRef
export type TokenOverrides = Partial<Record<TokenName, Partial<Record<TokenMode, TokenRef>>>>

export interface ResolvedToken {
	ref: TokenRef
	hex: string
	edited: boolean
}

export type ResolvedTokens = Record<TokenName, Record<TokenMode, ResolvedToken>>

const white = '#ffffff'
const darkTextRef: TokenRef = 'neutral.950'
const darkModeColorRatio = 4.5
const fillTextRatio = 4.5

export function isTokenName(value: string): value is TokenName {
	return (tokenNames as readonly string[]).includes(value)
}

export function isTokenMode(value: string): value is TokenMode {
	return (tokenModes as readonly string[]).includes(value)
}

export function parseTokenRef(value: string): { scale: SystemColorId; step: ScaleStep } | 'white' | null {
	if (value === 'white') return 'white'
	const [scale, step, ...rest] = value.split('.')
	if (rest.length || !scale || !step || !/^\d+$/.test(step)) return null
	const stepNumber = Number(step) as ScaleStep
	if (!(systemColorIds as readonly string[]).includes(scale) || !scaleSteps.includes(stepNumber)) return null
	return { scale: scale as SystemColorId, step: stepNumber }
}

export function isTokenRef(value: string): value is TokenRef {
	return parseTokenRef(value) !== null
}

export function scaleRef(scale: SystemColorId, step: ScaleStep): ScaleRef {
	return `${scale}.${step}`
}

export function refHex(system: ColorSystem, ref: TokenRef): string | null {
	const parsed = parseTokenRef(ref)
	if (!parsed) return null
	if (parsed === 'white') return white
	return system[parsed.scale]?.swatches.find((swatch) => swatch.step === parsed.step)?.hex ?? null
}

interface DefaultContext {
	mode: TokenMode
	system: ColorSystem
	token: (name: TokenName) => ResolvedToken
}

const pick = ({ mode }: DefaultContext, light: TokenRef, dark: TokenRef) => (mode === 'light' ? light : dark)

function anchorRef(context: DefaultContext, id: SystemColorId): TokenRef {
	const scale = context.system[id]!
	return scaleRef(id, scale.anchorStep ?? 500)
}

function liftedRef(context: DefaultContext, id: SystemColorId): TokenRef {
	const scale = context.system[id]!
	const background = context.token('background').hex
	const anchorIndex = scaleSteps.indexOf(scale.anchorStep ?? 500)
	for (let index = anchorIndex; index >= 0; index--) {
		if (wcagRatio(scale.swatches[index]!.hex, background) >= darkModeColorRatio) return scaleRef(id, scaleSteps[index]!)
	}
	return scaleRef(id, scaleSteps[0])
}

function colorRef(context: DefaultContext, id: SystemColorId): TokenRef {
	return context.mode === 'light' ? anchorRef(context, id) : liftedRef(context, id)
}

function bestTextRatio(system: ColorSystem, fillHex: string): number {
	return Math.max(wcagRatio(white, fillHex), wcagRatio(refHex(system, darkTextRef)!, fillHex))
}

function stepIndexesByDistance(fromIndex: number): number[] {
	return scaleSteps.map((_, index) => index).sort((a, b) => Math.abs(a - fromIndex) - Math.abs(b - fromIndex) || b - a)
}

function readableFillRef(context: DefaultContext, id: SystemColorId): TokenRef {
	if (context.mode === 'dark') return liftedRef(context, id)
	const scale = context.system[id]!
	const anchorIndex = scaleSteps.indexOf(scale.anchorStep ?? 500)
	const readableIndex = stepIndexesByDistance(anchorIndex).find(
		(index) => bestTextRatio(context.system, scale.swatches[index]!.hex) >= fillTextRatio,
	)
	return scaleRef(id, scaleSteps[readableIndex ?? anchorIndex]!)
}

function textOn(context: DefaultContext, fill: TokenName): TokenRef {
	const fillHex = context.token(fill).hex
	const darkText = refHex(context.system, darkTextRef)!
	return wcagRatio(white, fillHex) >= wcagRatio(darkText, fillHex) ? 'white' : darkTextRef
}

function chartRefs(context: DefaultContext): TokenRef[] {
	if (context.system.brand2) {
		return [anchorRef(context, 'brand'), anchorRef(context, 'brand2'), 'brand.300', 'brand2.300', 'brand.800']
	}
	return [anchorRef(context, 'brand'), 'brand.300', 'brand.700', 'brand.200', 'brand.900']
}

const defaults: Record<TokenName, (context: DefaultContext) => TokenRef> = {
	background: (c) => pick(c, 'white', 'neutral.950'),
	foreground: (c) => pick(c, 'neutral.950', 'neutral.50'),
	card: (c) => pick(c, 'white', 'neutral.900'),
	'card-foreground': (c) => c.token('foreground').ref,
	popover: (c) => c.token('card').ref,
	'popover-foreground': (c) => c.token('foreground').ref,
	primary: (c) => colorRef(c, 'brand'),
	'primary-foreground': (c) => textOn(c, 'primary'),
	secondary: (c) => (c.system.brand2 ? colorRef(c, 'brand2') : pick(c, 'neutral.100', 'neutral.800')),
	'secondary-foreground': (c) => (c.system.brand2 ? textOn(c, 'secondary') : pick(c, 'neutral.900', 'neutral.50')),
	accent: (c) => pick(c, 'neutral.100', 'neutral.800'),
	'accent-foreground': (c) => pick(c, 'neutral.900', 'neutral.50'),
	muted: (c) => pick(c, 'neutral.100', 'neutral.800'),
	'muted-foreground': (c) => pick(c, 'neutral.600', 'neutral.400'),
	border: (c) => pick(c, 'neutral.200', 'neutral.800'),
	input: (c) => pick(c, 'neutral.200', 'neutral.700'),
	ring: (c) => c.token('primary').ref,
	destructive: (c) => readableFillRef(c, 'danger'),
	'destructive-foreground': (c) => textOn(c, 'destructive'),
	success: (c) => readableFillRef(c, 'success'),
	'success-foreground': (c) => textOn(c, 'success'),
	warning: (c) => readableFillRef(c, 'warning'),
	'warning-foreground': (c) => textOn(c, 'warning'),
	info: (c) => readableFillRef(c, 'info'),
	'info-foreground': (c) => textOn(c, 'info'),
	'chart-1': (c) => chartRefs(c)[0]!,
	'chart-2': (c) => chartRefs(c)[1]!,
	'chart-3': (c) => chartRefs(c)[2]!,
	'chart-4': (c) => chartRefs(c)[3]!,
	'chart-5': (c) => chartRefs(c)[4]!,
	sidebar: (c) => pick(c, 'neutral.50', 'neutral.900'),
	'sidebar-foreground': (c) => c.token('foreground').ref,
	'sidebar-primary': (c) => c.token('primary').ref,
	'sidebar-primary-foreground': (c) => c.token('primary-foreground').ref,
	'sidebar-accent': (c) => pick(c, 'neutral.100', 'neutral.800'),
	'sidebar-accent-foreground': (c) => pick(c, 'neutral.900', 'neutral.50'),
	'sidebar-border': (c) => c.token('border').ref,
	'sidebar-ring': (c) => c.token('ring').ref,
}

export function resolveTokens(system: ColorSystem, overrides: TokenOverrides = {}): ResolvedTokens {
	const cache = new Map<string, ResolvedToken>()

	function resolve(name: TokenName, mode: TokenMode): ResolvedToken {
		const key = `${name}:${mode}`
		const cached = cache.get(key)
		if (cached) return cached
		const override = overrides[name]?.[mode]
		const overrideHex = override ? refHex(system, override) : null
		const ref =
			override && overrideHex
				? override
				: defaults[name]({ mode, system, token: (dependency) => resolve(dependency, mode) })
		const token = { ref, hex: overrideHex ?? refHex(system, ref)!, edited: !!overrideHex }
		cache.set(key, token)
		return token
	}

	return Object.fromEntries(
		tokenNames.map((name) => [name, { light: resolve(name, 'light'), dark: resolve(name, 'dark') }]),
	) as ResolvedTokens
}

export function nearbyRefs(ref: TokenRef): TokenRef[] {
	const parsed = parseTokenRef(ref)
	if (!parsed) return []
	const scale = parsed === 'white' ? 'neutral' : parsed.scale
	const currentIndex = parsed === 'white' ? -1 : scaleSteps.indexOf(parsed.step)
	const candidates: { ref: TokenRef; index: number }[] = scaleSteps.map((step, index) => ({
		ref: scaleRef(scale, step),
		index,
	}))
	if (scale === 'neutral') candidates.unshift({ ref: 'white', index: -1 })
	return candidates
		.filter((candidate) => candidate.ref !== ref)
		.sort((a, b) => Math.abs(a.index - currentIndex) - Math.abs(b.index - currentIndex))
		.map((candidate) => candidate.ref)
}
