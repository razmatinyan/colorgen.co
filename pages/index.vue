<template>
	<div class="home-wrapper">
			<HomeSvgs />
			<HomeHero />
			<HomeGradient />
			<HomeTrending />
	</div>
</template>

<script setup>
useSeoMeta({
	ogTitle: 'ColorGen - Create Stunning Color Palettes | colorgen.co',
	ogDescription: `Our Color Palette Generator makes easy to create stunning color schemes for your designs. With endless combinations of colors, you can experiment with random palettes or select your own color to achieve the perfect look.`,
	ogUrl: `https://colorgen.co`,
})
</script>

<style scoped>
.home-wrapper {
	position: relative;
	max-width: 1920px;
	margin: 0 auto;
	overflow: hidden;
	z-index: 10;
}
</style>