import { apcaContrast, wcagLevel, wcagRatio, type WcagLevel } from './contrast'
import type { ColorSystem } from './system'
import {
	nearbyRefs,
	refHex,
	resolveTokens,
	tokenModes,
	type ResolvedTokens,
	type TokenMode,
	type TokenName,
	type TokenOverrides,
	type TokenRef,
} from './tokens'

export const textRatio = 4.5
export const nonTextRatio = 3

export interface ReadabilityPair {
	id: string
	foreground: TokenName
	background: TokenName
	minRatio: number
	label: string
}

function pair(foreground: TokenName, background: TokenName, label: string, minRatio = textRatio): ReadabilityPair {
	return { id: `${foreground}/${background}`, foreground, background, minRatio, label }
}

export const readabilityPairs: readonly ReadabilityPair[] = [
	pair('foreground', 'background', 'Text on the page'),
	pair('muted-foreground', 'background', 'Secondary text on the page'),
	pair('card-foreground', 'card', 'Text on cards'),
	pair('popover-foreground', 'popover', 'Text in menus and popovers'),
	pair('muted-foreground', 'muted', 'Secondary text on muted fills'),
	pair('primary-foreground', 'primary', 'Text on primary buttons'),
	pair('secondary-foreground', 'secondary', 'Text on secondary buttons'),
	pair('accent-foreground', 'accent', 'Text on hovered items'),
	pair('destructive-foreground', 'destructive', 'Text on destructive buttons'),
	pair('success-foreground', 'success', 'Text on success fills'),
	pair('warning-foreground', 'warning', 'Text on warning fills'),
	pair('info-foreground', 'info', 'Text on info fills'),
	pair('sidebar-foreground', 'sidebar', 'Text in the sidebar'),
	pair('sidebar-primary-foreground', 'sidebar-primary', 'Text on the active sidebar item'),
	pair('sidebar-accent-foreground', 'sidebar-accent', 'Text on hovered sidebar items'),
	pair('primary', 'background', 'Primary buttons and links on the page', nonTextRatio),
	pair('ring', 'background', 'Focus ring on the page', nonTextRatio),
]

export interface ReadabilityResult {
	pair: ReadabilityPair
	mode: TokenMode
	foreground: string
	background: string
	ratio: number
	level: WcagLevel
	apca: number
	passes: boolean
}

export function checkReadability(tokens: ResolvedTokens): ReadabilityResult[] {
	return tokenModes.flatMap((mode) =>
		readabilityPairs.map((pair) => {
			const foreground = tokens[pair.foreground][mode].hex
			const background = tokens[pair.background][mode].hex
			const ratio = wcagRatio(foreground, background)
			return {
				pair,
				mode,
				foreground,
				background,
				ratio,
				level: wcagLevel(ratio),
				apca: apcaContrast(foreground, background),
				passes: ratio >= pair.minRatio,
			}
		}),
	)
}

function nearestPassing(system: ColorSystem, from: TokenRef, against: string, minRatio: number): TokenRef | null {
	return (
		nearbyRefs(from).find((ref) => {
			const hex = refHex(system, ref)
			return hex !== null && wcagRatio(hex, against) >= minRatio
		}) ?? null
	)
}

export interface ReadabilityFix {
	token: TokenName
	mode: TokenMode
	ref: TokenRef
}

export function findFix(
	system: ColorSystem,
	tokens: ResolvedTokens,
	pair: ReadabilityPair,
	mode: TokenMode,
): ReadabilityFix | null {
	const foreground = tokens[pair.foreground][mode]
	const background = tokens[pair.background][mode]
	const foregroundRef = nearestPassing(system, foreground.ref, background.hex, pair.minRatio)
	if (foregroundRef) return { token: pair.foreground, mode, ref: foregroundRef }
	const backgroundRef = nearestPassing(system, background.ref, foreground.hex, pair.minRatio)
	return backgroundRef ? { token: pair.background, mode, ref: backgroundRef } : null
}

export function withOverride(overrides: TokenOverrides, { token, mode, ref }: ReadabilityFix): TokenOverrides {
	return { ...overrides, [token]: { ...overrides[token], [mode]: ref } }
}

const maxFixRounds = 4

export function fixReadability(
	system: ColorSystem,
	overrides: TokenOverrides,
	only?: { pairId: string; mode: TokenMode },
): TokenOverrides {
	let next = overrides
	for (let round = 0; round < maxFixRounds; round++) {
		const tokens = resolveTokens(system, next)
		const failing = checkReadability(tokens).filter(
			(result) => !result.passes && (!only || (result.pair.id === only.pairId && result.mode === only.mode)),
		)
		if (!failing.length) return next
		let changed = false
		for (const result of failing) {
			const current = resolveTokens(system, next)
			const stillFails =
				wcagRatio(current[result.pair.foreground][result.mode].hex, current[result.pair.background][result.mode].hex) <
				result.pair.minRatio
			const fix = stillFails ? findFix(system, current, result.pair, result.mode) : null
			if (fix) {
				next = withOverride(next, fix)
				changed = true
			}
		}
		if (!changed) return next
	}
	return next
}
