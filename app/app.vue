<script setup lang="ts">
const colorMode = useColorMode()

const toastTheme = computed(() => (colorMode.value === 'dark' ? 'dark' : 'light'))
const toastOptions = {
	classes: {
		toast: 'rounded-2xl pr-11',
		description: 'text-muted-foreground',
		icon: 'self-start',
		closeButton:
			'top-3 right-3 bottom-auto left-auto transform-none cursor-default border-0 bg-transparent hover:bg-muted',
		actionButton: 'cursor-default',
		cancelButton: 'cursor-default',
		success: '[&_[data-icon]]:text-success',
		error: '[&_[data-icon]]:text-destructive',
		warning: '[&_[data-icon]]:text-warning',
	},
}
</script>

<template>
	<TooltipProvider :delay-duration="200">
		<NuxtLayout>
			<NuxtPage />
		</NuxtLayout>
		<AppCommandMenu />
		<Toaster
			close-button
			close-button-position="top-right"
			position="bottom-right"
			:theme="toastTheme"
			:toast-options="toastOptions"
		/>
	</TooltipProvider>
</template>
