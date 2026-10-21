import type { InjectionKey } from 'vue'
import { useDocumentVisibility, useIntervalFn, usePreferredReducedMotion } from '@vueuse/core'
import { parseColor, type Oklch } from '~/lib/color'
import { toBrandsParam } from '~/lib/builder-url'

export const landingSamples = [
	'#2f5bea',
	'#0f9488',
	'#f0603c',
	'#7c3aed',
	'#2f7d4a',
	'#e11d64',
	'#d99a0b',
	'#1e293b',
] as const

const cycleInterval = 3800

export function useLandingDemo() {
	const builder = useDesignSystemBuilder({ brand: parseColor(landingSamples[0])! })
	const sampleIndex = ref(0)
	const isTouched = ref(false)
	const reducedMotion = usePreferredReducedMotion()
	const visibility = useDocumentVisibility()

	function showBrand(brand: Oklch) {
		builder.settings.value = { ...builder.settings.value, brand, extras: [], extraNames: [], status: {}, tokens: {} }
	}

	const cycle = useIntervalFn(
		() => {
			if (visibility.value !== 'visible') return
			sampleIndex.value = (sampleIndex.value + 1) % landingSamples.length
			showBrand(parseColor(landingSamples[sampleIndex.value]!)!)
		},
		cycleInterval,
		{ immediate: false },
	)

	onMounted(() => {
		if (reducedMotion.value !== 'reduce') cycle.resume()
	})

	function chooseBrand(brand: Oklch) {
		isTouched.value = true
		cycle.pause()
		showBrand(brand)
	}

	return {
		builder,
		isTouched,
		chooseBrand,
		builderPath: computed(() => `/builder/${toBrandsParam(builder.settings.value)}`),
	}
}

export type LandingDemo = ReturnType<typeof useLandingDemo>
export const landingDemoKey: InjectionKey<LandingDemo> = Symbol('landing-demo')
