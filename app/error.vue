<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()

const isNotFound = computed(() => props.error.statusCode === 404)

useSeoMeta({
	title: () => (isNotFound.value ? 'Page not found | colorgen.co' : 'Something went wrong | colorgen.co'),
	robots: 'noindex',
})
</script>

<template>
	<NuxtLayout>
		<section class="mx-auto flex max-w-xl flex-col items-center px-6 py-32 text-center">
			<Badge variant="secondary">Error {{ error.statusCode }}</Badge>
			<h1 class="mt-4 text-4xl font-semibold tracking-(--tracking-display)">
				{{ isNotFound ? 'This color is out of gamut.' : 'Something went wrong.' }}
			</h1>
			<p class="mt-4 text-muted-foreground">
				{{ isNotFound ? 'The page you are looking for does not exist or has moved.' : error.message }}
			</p>
			<Button class="mt-8" size="lg" @click="clearError({ redirect: '/' })">Back to home</Button>
		</section>
	</NuxtLayout>
</template>
