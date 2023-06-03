<template>
	<section id="image">
		<div class="container row">
			<div class="image-right">
				<img class="right-image" :src="imageSVG" alt="image">
			</div>
			<div class="image-left">
				<div class="in">
					<h1 class="image-title">
						Extract Colors <br> From Image
					</h1>
					<p class="image-description">
						Extract colors from your images with our Image Color Extractor tool.
					</p>
					<NuxtLink to="/image-colors" class="image-link btn btn-medium btn-purple btn-padding-40">Extract Colors</NuxtLink>
				</div>
			</div>
		</div>

	</section>
</template>

<script setup>
import imageSVG from '@/assets/home/image.svg?url'
</script>

<style scoped>
#image {
	padding-top: 60px;
}
.container {
	display: flex;
	align-items: center;
	flex-direction: row-reverse;
}
.image-left {
	flex-basis: 50%;
}
.image-left > .in {
	text-align: center;
}
.image-title {
	font-size: var(--font-clamp);
}
.image-description {
	margin-bottom: 30px;
	color: var(--gray-3);
}
.image-link {
	width: max-content;
	margin: 0 auto;
}

.image-right {
	flex-basis: 50%;
	padding-left: 50px;
}
.right-image {
	user-select: none;
	pointer-events: none;
}

@media only screen and (max-width: 1023px) {
	#image > .container {
		flex-direction: column-reverse;
		height: auto;
	}
	.image-left {
		flex-basis: 100%;
	}
	.image-right {
		flex-basis: 100%;
		padding-left: 0;
	}
}

@media only screen and (max-width: 600px) {
	#image {
		padding-top: 80px;
	}
}
</style>