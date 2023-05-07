<template>
	<section id="home">
		<div class="container row">
			<div class="hero-left">
				<div class="in">
					<h1 class="main-title">
						Generate Cool Color Palettes
					</h1>
					<p class="hero-description">
						Generate beautiful color palettes with our easy-to-use Color Palette Generator. Experiment with random palettes or select your own colors to create eye-catching designs in seconds.
					</p>
					<div class="buttons">
						<button @click="generateRandomPalette" :disabled="disableButton" class="button btn btn-medium btn-padding-40 btn-blue">Generate Palettes</button>
					</div>
				</div>
			</div>
			<div class="hero-right">
				<img :src="HomeSVG" alt="Home Persons">
			</div>
		</div>
	</section>
</template>

<script setup>
import HomeSVG from '@/assets/home/hero-photo.svg?url'

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
#home {
	position: relative;
	height: 600px;
	padding-top: 150px;
	z-index: 1;
}
#home > .container {
	height: 100%;
	align-items: center;
}
.hero-left {
	position: relative;
	width: 100%;
	z-index: 3;
}
.hero-left > .in {
	max-width: 432px;
}
.main-title {
	font-size: var(--font-clamp);
}
.title-line {
	display: block;
}
.hero-description {
	margin-bottom: 34px;
	color: var(--gray-3);
}
.buttons > .button {
	margin-bottom: 14px;
}
.buttons > .button:last-child {
	margin-bottom: 0;
}
.hero-right {
	position: absolute;
	top: 50%;
	transform: translate(0, -50%);
	right: -120px;
	display: block;
	width: 840px;
	z-index: -1;
}
.hero-right > img {
	width: 100%;
	user-select: none;
	pointer-events: none;
}

@media only screen and (max-width: 1599px) {
	#home {
		padding-top: 56px;
		padding-right: 20px;
	}
	.hero-right {
		right: 0;
		width: 600px;
	}
}

@media only screen and (max-width: 1023px) {
	#home {
		padding-right: 0;
		height: auto;
	}
	#home > .container {
		flex-direction: column;
		height: auto;
	}
	.hero-right {
		position: static;
		max-width: 600px;
		width: 100%;
		transform: translate(0, 0);
	}
	.hero-left {
		margin-bottom: 50px;
	}
	.hero-left > .in[data-v-4824f9c4] {
		margin: 0 auto;
		text-align: center;
	}
}
</style>