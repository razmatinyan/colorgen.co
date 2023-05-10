<template>
	<section id="image-colors">
		<div class="container">
			<h1 class="image-title big-title text-center">Image Colors</h1>
			
			<p class="image-descr">
				Extract the main colors from the images using our extracting tool.
			</p>
		</div>
	</section>
</template>

<script setup>
// TODO: Add https://lokeshdhakar.com/projects/color-thief/ library to the project
</script>

<style scoped>
#image-colors {
	padding-top: 70px;
}
.image-title {
	margin-bottom: 34px;
}
.image-descr {
	max-width: 900px;
	margin: 0 auto;
	margin-bottom: 34px;
	color: var(--gray-3);
	text-align: center;
}

@media only screen and (max-width: 769px) {
	#palette-static {
		padding-top: 56px;
	}
}
</style>