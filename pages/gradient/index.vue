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

		<img class="person-img" :src="Person" alt="Person">
	</section>
</template>

<script setup>
import Person from '@/assets/gradient/person.svg?url'

const { $chroma } = useNuxtApp();
const schemes = useHomeSchemes();
const count = useColorCount();
const disableButton = ref(false);

function openGradientMaker() {
	setTimeout(() => {
		disableButton.value = false
	}, 2000);

	navigateTo(`/gradient/${$chroma.random().hex().substring(1)}-${$chroma.random().hex().substring(1)}`);
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
.person-img {
	max-width: 590px;
	margin: 0 auto;
}
</style>