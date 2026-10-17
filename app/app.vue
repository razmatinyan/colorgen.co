<script setup lang="ts">
const colorMode = useColorMode()

const toastTheme = computed(() => (colorMode.value === 'dark' ? 'dark' : 'light'))
const toastOptions = {
	classes: {
		toast: 'rounded-2xl',
		description: 'text-muted-foreground!',
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
		<Toaster position="bottom-right" :theme="toastTheme" :toast-options="toastOptions" />
	</TooltipProvider>
</template>
