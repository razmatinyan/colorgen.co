<template>
	<div class="home-wrapper">

		<HomeSvgs />
		<HomeHero />
		<HomeTrending />

	</div>

</template>

<script setup>
useSeoMeta({
	ogTitle: 'Color Palette Generator - Create Stunning Color Schemes Online | colorgen.co',
	ogDescription: `Our Color Palette Generator makes it easy to create stunning color schemes for your designs. With endless combinations of colors to choose from, you can experiment with random palettes or select your own colors to achieve the perfect look. Whether you're a designer or simply want to add some color to your project, our online tool is the perfect solution. Try our Color Palette Generator today and start creating eye-catching designs in no time!`,
	ogUrl: `https://colorgen.co`,
})
</script>

<style scoped>
.home-wrapper {
	position: relative;
}
</style>