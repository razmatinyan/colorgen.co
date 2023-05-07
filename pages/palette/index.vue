<template>
	<section id="palette-static" class="container">
		<h1 class="palette-title big-title text-center">
			Palette Generator
		</h1>

		<p class="palette-descr">
			Generate beautiful color palettes with our easy-to-use Color Palette Generator. Experiment with random palettes or select your own colors to create eye-catching designs in seconds.
		</p>

		<div class="palette-btn-wrap">
			<button id="random-btn" :disabled="disableButton" @click="generateRandomPalette" class="gnr-btn btn btn-medium btn-blue btn-min-width-200">Start Generate</button>
		</div>

		<img class="person-img" :src="Person" alt="Person">
	</section>
</template>

<script setup>
import Person from '@/assets/palette/person.svg?url'

const { $chroma } = useNuxtApp();
const schemes = useHomeSchemes();
const count = useColorCount();
const disableButton = ref(false);

function generateRandomPalette() {
	disableButton.value = true
	
	if ( count.value <= 0 ) count.value = 5
	else if ( count.value >= 15 ) count.value = 15
	
	let colors;
	const randomType = randomNumber(1, 2);
	
	if ( randomType === 1 ) {
		let inputColor = $chroma.random().hex();
		colors = generatePalette(inputColor, schemes.value[Math.floor((Math.random() * schemes.value.length))], count.value);
		colors = colors.map(c => c.substring(1)).join('-');
	} else if ( randomType === 2 ) {
		colors = new Array();
		for( let i = 1; i <= count.value; i++ ) {
			colors.push($chroma.random().hex());
		}
		colors = colors.map(c => c.substring(1)).join('-');
	}

	setTimeout(() => {
		disableButton.value = false
	}, 2000)

	navigateTo('/palette/'+colors);
}

function randomNumber(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min)
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
	max-width: 700px;
	margin: 0 auto;
	margin-bottom: 34px;
	color: var(--gray-3);
	text-align: center;
}
.gnr-btn {
	max-width: 200px;
	margin: 0 auto 50px auto;
}
.person-img {
	max-width: 500px;
	margin: 0 auto;
}

@media only screen and (max-width: 769px) {
	#palette-static {
		padding-top: 56px;
	}
}
</style>