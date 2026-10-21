import { onKeyStroke } from '@vueuse/core'
import { visionTypes, type VisionType } from '~/lib/color'
import { isInteractiveTarget } from '~/lib/keyboard'

export function useVisionSimulation(isShortcutActive: () => boolean = () => true) {
	const vision = ref<VisionType>('normal')

	function cycle() {
		const next = (visionTypes.indexOf(vision.value) + 1) % visionTypes.length
		vision.value = visionTypes[next]!
	}

	onKeyStroke(['v', 'V'], (event) => {
		if (isInteractiveTarget(event) || event.metaKey || event.ctrlKey || event.altKey || !isShortcutActive()) return
		event.preventDefault()
		cycle()
	})

	return { vision, cycle }
}
