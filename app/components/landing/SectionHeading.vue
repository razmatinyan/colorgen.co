<script setup lang="ts">
withDefaults(defineProps<{ label: string, title: string, description?: string, align?: 'start' | 'center' }>(), { align: 'start' })
</script>

<template>
	<LandingReveal class="grid max-w-2xl gap-3" :class="align === 'center' && 'mx-auto justify-items-center text-center'">
		<p class="text-sm font-medium text-muted-foreground">{{ label }}</p>
		<h2 class="text-3xl font-semibold tracking-(--tracking-display) text-balance sm:text-4xl">{{ title }}</h2>
		<p v-if="description" class="text-lg text-pretty text-muted-foreground">{{ description }}</p>
	</LandingReveal>
</template>
