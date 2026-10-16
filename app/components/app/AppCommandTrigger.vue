<script setup lang="ts">
const { show } = useCommandMenu()

// Platform is only known on the client; default to Ctrl and switch after mount.
const isMac = ref(false)
onMounted(() => {
	isMac.value = /Mac|iPhone|iPad/.test(navigator.userAgent)
})
</script>

<template>
	<button
		type="button"
		class="hidden h-8 w-52 items-center gap-2 rounded-4xl bg-muted/60 pr-1.5 pl-3 text-sm text-muted-foreground transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 lg:flex"
		aria-label="Open command menu"
		@click="show"
	>
		<Icon name="lucide:search" class="size-4" />
		Search tools…
		<KbdGroup class="ml-auto">
			<Kbd>{{ isMac ? '⌘' : 'Ctrl' }}</Kbd>
			<Kbd>K</Kbd>
		</KbdGroup>
	</button>
	<Button variant="ghost" size="icon" class="lg:hidden" aria-label="Open command menu" @click="show">
		<Icon name="lucide:search" />
	</Button>
</template>
