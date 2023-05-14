<template>
	<section id="trending">
		<h2 class="title big-title text-center container">
			Trending Palettes
		</h2>

		<div class="palettes container">
			<PaletteCard 
				v-for="(item, index) in palettes"
				:key="index"
				:item="item"
				:showDelete="false"
				@copied="handleToast($event)"
				@copyURL="handleCopyURL($event)"
			/>
		</div>

		<Teleport to="body">
			<Toast :messages="messages" />
		</Teleport>

	</section>
</template>

<script setup>
import trendingPalettes from '../../info/trendingPalettes'

const palettes = trendingPalettes;
const messages = ref([]);

function showToast(message, type, color) {
	messages.value.unshift(
		{
			id: Date.now().toLocaleString(),
			name: message,
			type: type
		}
	);
}

function handleToast(color) {
	showToast(`You copied this color: ${color.toUpperCase()}`, 'info');
}

function handleCopyURL(palette) {
	copyURL('https://colorgen.co/palette/' + palette);

	showToast(`You copied palette URL`, 'info');
}

</script>

<style scoped>
#trending {
	padding-top: 100px;
}
.title {
	margin-bottom: 70px;
}
.palettes {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	grid-gap: 30px;
}

@media only screen and (max-width: 1599px) {
	#trending {
		padding-top: 100px;
	}
}

@media only screen and (max-width: 1023px) {
	.palettes {
		grid-template-columns: repeat(2, 1fr);
	}
}

@media only screen and (max-width: 600px) {
	#trending {
		padding-top: 80px;
	}
	.palettes {
		grid-template-columns: repeat(1, 1fr);
	}
}
@media only screen and (max-width: 480px) {
	.title {
		margin-bottom: 40px;
	}
}
</style>