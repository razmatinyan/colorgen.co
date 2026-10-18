<script setup lang="ts">
import { designSystemBuilderKey } from '~/composables/useDesignSystemBuilder'
import { landingDemoKey, useLandingDemo } from '~/composables/useLandingDemo'

const demo = useLandingDemo()
provide(landingDemoKey, demo)
provide(designSystemBuilderKey, demo.builder)

const siteUrl = 'https://sygen.app'
const title = 'Sygen: Turn your brand color into a complete design system'
const description =
	'Brand, neutral and status color scales, light and dark tokens that pass WCAG, and exports for Tailwind, shadcn, CSS and Figma, from one brand color. Free, no sign-up.'

useSeoMeta({
	title,
	description,
	ogTitle: title,
	ogDescription: description,
	ogUrl: siteUrl,
})
useHead({
	link: [{ rel: 'canonical', href: siteUrl }],
})
</script>

<template>
	<div class="overflow-x-clip">
		<LandingHero />
		<LandingBento />
		<LandingBuilderShowcase />
		<LandingReadabilityShowcase />
		<LandingExportShowcase />
		<LandingToolsGrid />
		<LandingFinalCta />
	</div>
</template>
