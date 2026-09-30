<template>
	<section id="palette-static" class="container">
		<h1 class="palette-title big-title text-center">
			Gradient Palette
		</h1>

		<p class="palette-descr">
			Our easy-to-use platform allows you to quickly generate gradient color palette by selecting your preferred colors.
		</p>

		<div class="palette-btn-wrap">
			<button id="random-btn" :disabled="disableButton" @click="openGradientMaker" class="gnr-btn btn btn-medium btn-blue btn-min-width-200">Try it now</button>
		</div>
		
		<GradientSvgPerson />
	</section>
</template>

<script setup>
useHead({
	link: [
		{
			rel: 'canonical',
			href: 'https://colorgen.co/gradient'
		},
	]
})

useSeoMeta({
	title: 'Create Stunning Gradient Color Palettes with Our Easy-To-Use Generator | colorgen.co',
	description: 'Discover the perfect color combination for your next project with our color palette generator. Our easy-to-use tool lets you customize each color, so you can achieve the perfect blend for your design.',
	keywords: 'Gradient Color Palette, Palette, gradient, gradient colors, Generate, Generator, Colorgen',
	ogTitle: 'Create Stunning Gradient Color Palettes with Our Easy-To-Use Generator | colorgen.co',
	ogDescription: 'Discover the perfect color combination for your next project with our color palette generator. Our easy-to-use tool lets you customize each color, so you can achieve the perfect blend for your design.',
	ogUrl: `https://colorgen.co/gradient`,
})

const { $chroma } = useNuxtApp();
const disableButton = ref(false);

function openGradientMaker() {
	setTimeout(() => {
		disableButton.value = false
	}, 2000);

	navigateTo(`/gradient/${$chroma.random().hex().substring(1)}-${$chroma.random().hex().substring(1)}`);
}
</script>

<style scoped>
#palette-static {
	padding-top: 70px;
}
.palette-title {
	margin-bottom: 34px;
}
.palette-descr {
	max-width: 900px;
	margin: 0 auto;
	margin-bottom: 34px;
	color: var(--gray-3);
	text-align: center;
}
.gnr-btn {
	max-width: 200px;
	margin: 0 auto 50px auto;
}

@media only screen and (max-width: 769px) {
	#palette-static {
		padding-top: 56px;
	}
}

</style>