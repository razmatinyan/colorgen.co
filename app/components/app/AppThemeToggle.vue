<script setup lang="ts">
const colorMode = useColorMode()

const modes = [
	{ value: 'system', label: 'System theme', icon: 'lucide:monitor' },
	{ value: 'light', label: 'Light theme', icon: 'lucide:sun' },
	{ value: 'dark', label: 'Dark theme', icon: 'lucide:moon' },
] as const

const current = computed(() => modes.find(mode => mode.value === colorMode.preference) ?? modes[0])

function cycle() {
	const index = modes.findIndex(mode => mode.value === colorMode.preference)
	colorMode.preference = modes[(index + 1) % modes.length]!.value
}
</script>

<template>
	<Tooltip>
		<TooltipTrigger as-child>
			<Button variant="ghost" size="icon" :aria-label="current.label" @click="cycle">
				<ClientOnly>
					<Icon :name="current.icon" class="size-4" />
					<template #fallback>
						<Icon name="lucide:monitor" class="size-4" />
					</template>
				</ClientOnly>
			</Button>
		</TooltipTrigger>
		<TooltipContent>{{ current.label }}</TooltipContent>
	</Tooltip>
</template>
