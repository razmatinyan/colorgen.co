<template>
	<section id="gradient">
		<div class="container row">
			<div class="gradient-left">
				<div class="in">
					<h1 class="gradient-title">
						Make Awesome Gradient Palettes
					</h1>
					<p class="gradient-description">
						Create visually striking and dynamic color transitions that will captivate your audience. Get started now!
					</p>
					<NuxtLink to="/gradient/163c4f-c45e68" class="gradient-link btn btn-medium btn-green btn-padding-40">Make Gradient</NuxtLink>
				</div>
			</div>
			<div class="gradient-right">
				<img class="right-image" :src="GradientSVG" alt="Gradient">
			</div>
		</div>

	</section>
</template>

<script setup>
import GradientSVG from '@/assets/home/gradient.svg?url'
</script>

<style scoped>
#gradient {
	padding-top: 230px;
}
.container {
	display: flex;
	align-items: center;
	flex-direction: row-reverse;
}
.gradient-left {
	flex-basis: 50%;
}
.gradient-left > .in {
	text-align: center;
}
.gradient-title {
	font-size: var(--font-clamp);
}
.gradient-description {
	margin-bottom: 30px;
	color: var(--gray-3);
}
.gradient-link {
	width: max-content;
	margin: 0 auto;
}

.gradient-right {
	flex-basis: 50%;
	padding-right: 50px;
}
.right-image {
	user-select: none;
	pointer-events: none;
}

@media only screen and (max-width: 1599px) {
	#gradient {
		padding-top: 100px;
	}
}

@media only screen and (max-width: 1023px) {
	#gradient > .container {
		flex-direction: column;
		height: auto;
	}
	.gradient-left {
		flex-basis: 100%;
		margin-bottom: 50px;
	}
	.gradient-right {
		flex-basis: 100%;
		padding-right: 0;
	}
}

@media only screen and (max-width: 600px) {
	#gradient {
		padding-top: 80px;
	}
}
</style>