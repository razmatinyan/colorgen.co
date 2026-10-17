import { describe, expect, it } from 'vitest'
import { toHex } from './format'
import { parseColor } from './parse'
import { scaleSteps } from './scale'
import { suggestStatusColor } from './status'
import { generateSystem, systemColorIds, systemScales, type SystemSettings } from './system'

const brand = parseColor('#1f6cb0')!
const settings: SystemSettings = { brand, brand2: null, neutralTint: 0.3, status: {} }

describe('generateSystem', () => {
	it('returns a full scale for every system color', () => {
		const system = generateSystem({ ...settings, brand2: parseColor('#8b5cf6')! })
		expect(Object.keys(system)).toEqual([...systemColorIds])
		for (const id of systemColorIds) {
			expect(system[id]!.id).toBe(id)
			expect(system[id]!.swatches.map(swatch => swatch.step)).toEqual([...scaleSteps])
		}
	})

	it('contains the exact brand color at its anchor step', () => {
		const { brand: brandScale } = generateSystem(settings)
		expect(brandScale.anchorStep).not.toBeNull()
		expect(brandScale.swatches.find(swatch => swatch.step === brandScale.anchorStep)!.hex).toBe('#1f6cb0')
	})

	it('suggests status colors from the brand', () => {
		const system = generateSystem(settings)
		expect(toHex(system.danger.base)).toBe(toHex(suggestStatusColor('danger', brand)))
	})

	it('uses an edited status color instead of the suggestion', () => {
		const edited = parseColor('#b91c1c')!
		const system = generateSystem({ ...settings, status: { danger: edited } })
		expect(system.danger.base).toEqual(edited)
		expect(system.danger.swatches.some(swatch => swatch.hex === '#b91c1c')).toBe(true)
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

describe('second brand color', () => {
	it('is absent unless set', () => {
		expect(generateSystem(settings).brand2).toBeNull()
		expect(systemScales(generateSystem(settings)).map(scale => scale.id)).not.toContain('brand2')
	})

	it('gets a full anchored scale when set', () => {
		const system = generateSystem({ ...settings, brand2: parseColor('#8b5cf6')! })
		expect(system.brand2!.swatches.some(swatch => swatch.hex === '#8b5cf6')).toBe(true)
		expect(systemScales(system).map(scale => scale.id)).toEqual([...systemColorIds])
	})
})
