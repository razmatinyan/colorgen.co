<template>
	<div id="error" class="cg-content">
		<Header />
		<img class="image" :src="ErrorSVG" alt="404">
		<NuxtLink to="/" class="home-link btn btn-blue btn-medium">Go Back Home</NuxtLink>
	</div>
</template>

<script setup>
import ErrorSVG from '@/assets/404.svg?url'

defineProps(['error']);
</script>

<style scoped>
.cg-content {
	padding-top: 140px;
}
.image {
	max-width: 800px;
	margin: 0 auto 30px auto;
}
.home-link {
	max-width: 200px;
	margin: 0 auto;
}

@media only screen and (max-width: 769px) {
	.cg-content {
		padding-top: 70px;
	}
}
</style>