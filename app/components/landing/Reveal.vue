<script setup lang="ts">
import { useIntersectionObserver } from '@vueuse/core'

withDefaults(defineProps<{ delay?: number; as?: string }>(), { delay: 0, as: 'div' })

const target = useTemplateRef<HTMLElement>('target')
const isArmed = ref(false)
const isVisible = ref(false)

onMounted(() => {
	isArmed.value = true
})

const { stop } = useIntersectionObserver(
	target,
	([entry]) => {
		if (!entry?.isIntersecting) return
		isVisible.value = true
		stop()
	},
	{ threshold: 0.12 },
)
</script>

<template>
	<component
		:is="as"
		ref="target"
		class="transition-[opacity,translate] duration-700 ease-out"
		:class="isArmed && !isVisible && 'translate-y-6 opacity-0'"
		:style="{ transitionDelay: `${delay}ms` }"
	>
		<slot />
	</component>
</template>
