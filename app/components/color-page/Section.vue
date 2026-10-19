<script setup lang="ts">
defineProps<{ id: string; title: string; description: string }>()
</script>

<template>
	<section :aria-labelledby="id" class="grid gap-6 border-t py-14 lg:py-16">
		<div class="flex flex-wrap items-end justify-between gap-4">
			<div class="grid max-w-2xl gap-2">
				<h2 :id="id" class="text-2xl font-semibold tracking-(--tracking-heading) text-balance sm:text-3xl">
					{{ title }}
				</h2>
				<p class="text-pretty text-muted-foreground">{{ description }}</p>
			</div>
			<slot name="actions" />
		</div>
		<slot />
	</section>
</template>
