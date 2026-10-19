<script setup lang="ts">
import { buildColorPage, colorPageSummary, colorPageTitle, parseColorPageParam } from '~/lib/color-page'

definePageMeta({
	key: 'color',
	validate: (route) =>
		parseColorPageParam(typeof route.params.hex === 'string' ? route.params.hex : undefined) !== null,
})

const route = useRoute()
const hexParam = computed(() => (typeof route.params.hex === 'string' ? route.params.hex : undefined))
const parsed = computed(() => parseColorPageParam(hexParam.value))

if (parsed.value && 'redirect' in parsed.value) {
	await navigateTo(`/color/${parsed.value.redirect}`, { replace: true, redirectCode: 301 })
}

const page = computed(() => {
	const current = parsed.value
	return buildColorPage(current && 'hex' in current ? current.hex : `#${hexParam.value}`)
})
const summary = computed(() => colorPageSummary(page.value))

const title = computed(() => `${colorPageTitle(page.value)} | Sygen`)

useSeoMeta({
	title,
	description: summary,
	ogTitle: title,
	ogDescription: summary,
})
useCanonicalUrl(() => `/color/${page.value.hex.slice(1)}`)
usePageOgImage({ kind: 'color', colors: page.value.hex.slice(1) })
</script>

<template>
	<div class="mx-auto max-w-7xl px-4 sm:px-6">
		<ColorPageHero :page="page" :summary="summary" />
		<ColorPageShades :page="page" />
		<ColorPageReadability :page="page" />
		<ColorPagePalettes :page="page" />
		<ColorPageBrandSystem :page="page" />
		<ColorPageRelated :page="page" />
	</div>
</template>
