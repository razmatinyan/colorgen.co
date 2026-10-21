import { describe, expect, it } from 'vitest'
import { toHex } from './format'
import { parseColor } from './parse'
import { scaleSteps } from './scale'
import { suggestStatusColor } from './status'
import {
	extraColorId,
	extraColorIndex,
	fixedColorIds,
	generateSystem,
	isSystemColorId,
	systemScale,
	systemScales,
	type SystemSettings,
} from './system'

const brand = parseColor('#1f6cb0')!
const settings: SystemSettings = { brand, extras: [], neutralTint: 0.3, status: {} }

describe('generateSystem', () => {
	it('returns a full scale for every system color', () => {
		const system = generateSystem({ ...settings, extras: [parseColor('#8b5cf6')!] })
		for (const scale of systemScales(system)) {
			expect(systemScale(system, scale.id)).toBe(scale)
			expect(scale.swatches.map((swatch) => swatch.step)).toEqual([...scaleSteps])
		}
		expect(systemScales(system).map((scale) => scale.id)).toEqual(['brand', 'brand2', ...fixedColorIds.slice(1)])
	})

	it('contains the exact brand color at its anchor step', () => {
		const { brand: brandScale } = generateSystem(settings)
		expect(brandScale.anchorStep).not.toBeNull()
		expect(brandScale.swatches.find((swatch) => swatch.step === brandScale.anchorStep)!.hex).toBe('#1f6cb0')
	})

	it('suggests status colors from the brand', () => {
		const system = generateSystem(settings)
		expect(toHex(system.danger.base)).toBe(toHex(suggestStatusColor('danger', brand)))
	})

	it('uses an edited status color instead of the suggestion', () => {
		const edited = parseColor('#b91c1c')!
		const system = generateSystem({ ...settings, status: { danger: edited } })
		expect(system.danger.base).toEqual(edited)
		expect(system.danger.swatches.some((swatch) => swatch.hex === '#b91c1c')).toBe(true)
		expect(toHex(system.success.base)).toBe(toHex(suggestStatusColor('success', brand)))
	})

	it('has no anchor for the neutral scale and uses its 500 step as base', () => {
		const { neutral } = generateSystem(settings)
		expect(neutral.anchorStep).toBeNull()
		expect(neutral.base).toEqual(neutral.swatches[5]!.color)
	})

	it('tints the neutral scale more as the tint grows', () => {
		const subtle = generateSystem({ ...settings, neutralTint: 0.1 }).neutral.base.c
		const strong = generateSystem({ ...settings, neutralTint: 0.9 }).neutral.base.c
		expect(strong).toBeGreaterThan(subtle)
	})
})

describe('extra colors', () => {
	const extras = ['#8b5cf6', '#14b8a6', '#f43f5e'].map((hex) => parseColor(hex)!)

	it('are absent unless set', () => {
		const system = generateSystem(settings)
		expect(system.extras).toEqual([])
		expect(systemScales(system).map((scale) => scale.id)).toEqual([...fixedColorIds])
	})

	it('each get a full anchored scale, after the brand and in order', () => {
		const system = generateSystem({ ...settings, extras })
		expect(system.extras.map((scale) => scale.id)).toEqual(['brand2', 'brand3', 'brand4'])
		expect(system.extras[2]!.swatches.some((swatch) => swatch.hex === '#f43f5e')).toBe(true)
		expect(
			systemScales(system)
				.map((scale) => scale.id)
				.slice(0, 4),
		).toEqual(['brand', 'brand2', 'brand3', 'brand4'])
	})

	it('are found by id, and missing ones return null', () => {
		const system = generateSystem({ ...settings, extras })
		expect(systemScale(system, 'brand3')!.base).toEqual(extras[1])
		expect(systemScale(system, 'brand9')).toBeNull()
	})
})

describe('color ids', () => {
	it('number extra colors from 2', () => {
		expect(extraColorId(0)).toBe('brand2')
		expect(extraColorId(10)).toBe('brand12')
		expect(extraColorIndex('brand2')).toBe(0)
		expect(extraColorIndex('brand12')).toBe(10)
	})

	it.each(['brand', 'brand1', 'brand0', 'brand02', 'brand-2', 'brand2.5', 'neutral'])(
		'rejects %j as an extra id',
		(id) => {
			expect(extraColorIndex(id)).toBeNull()
		},
	)

	it('recognizes fixed and extra ids', () => {
		expect(isSystemColorId('brand')).toBe(true)
		expect(isSystemColorId('brand7')).toBe(true)
		expect(isSystemColorId('danger')).toBe(true)
		expect(isSystemColorId('brand1')).toBe(false)
		expect(isSystemColorId('primary')).toBe(false)
	})
})
