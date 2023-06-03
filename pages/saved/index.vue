<template>
	<section id="saved" class="paddings">
		<h1 class="saved-title big-title text-center">
			Saved Palettes
		</h1>

		<div v-if="savedPalettes !== undefined" class="palettes">
			<PaletteCard 
				v-for="(item, index) in savedPalettes"
				:key="index"
				:item="item"
				@copied="handleToast($event)"
				@copyURL="handleCopyURL($event)"
				@unsave="handleUnsaveModal($event)"
			/>
		</div>
		
		<div v-else class="empty">
			<p class="empty-text">You don't have any saved palette.</p>
			
			<div class="palette-btn-wrap">
				<button id="random-btn" :disabled="disableButton" @click="generateRandomPalette" class="gnr-btn btn btn-medium btn-blue btn-min-width-200">Start Generate</button>
			</div>
		</div>
		
		<Teleport to="body">
			<Toast :messages="messages" />

			<Modal ref="modal" :modalTitle="'Delete palette'">
				<template #content>
					<p class="content-text">
						Are you sure you want to delete this palette?
					</p>
				</template>

				<template #buttons>
					<div class="custom-buttons">
						<button class="button no-btn btn btn-medium btn-border" @click="modal.showContent = false">Cancel</button>
						<button class="button yes-btn btn btn-medium btn-red" @click="handleUnsave(deletePalette)">Delete</button>
					</div>
				</template>
			</Modal>
		</Teleport>

	</section>
</template>

<script setup>
useHead({
	link: [
		{
			rel: 'canonical',
			href: 'https://colorgen.co/palette/saved'
		},
	]
})

useSeoMeta({
	title: 'Saved Palettes | colorgen.co',
	description: "Discover through your favorite color palettes and download them for future use.",
	keywords: 'Color Palette, Saved, Palettes, Generate, Download, Generator, Colorgen',
	ogTitle: 'Saved Palettes | colorgen.co',
	ogDescription: "Discover through your favorite color palettes and download them for future use.",
	ogUrl: `https://colorgen.co/saved`,
})

const savedPalettes = useCookie('saved-palettes');
const modal = ref('');
const messages = ref([]);
const deletePalette = ref('');

function showToast(message, type, color) {
	messages.value.unshift(
		{
			id: Date.now().toLocaleString(),
			name: message,
			type: type
		}
	);
}

function handleUnsaveModal(palette) {
	if ( modal.value.showModal === false ) {
		deletePalette.value = palette
		modal.value.showModal = true
	} else {
		deletePalette.value = '';
	}
}

async function handleUnsave(palette) {
	const res = await $fetch('/api/saved/palettes', {
		method: 'POST',
		body: {
			palette: palette,
			action: 'delete'
		}
	});

	if ( res.action === 'unsaved' ) {
		showToast('You successfully deleted palette.', 'info');

		savedPalettes.value = res.newSaved;
		deletePalette.value = '';
	}
	else if ( res.status === 400 ) showToast(res.action, 'error');

	modal.value.showContent = false;
}

function handleToast(color) {
	showToast(`You copied this color: ${color.toUpperCase()}`, 'info');
}
function handleCopyURL(palette) {
	copyURL('https://colorgen.co/palette/' + palette);

	showToast(`You copied palette URL`, 'info');
}

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
#saved {
	padding-top: 70px;
}
.saved-title {

}
.palettes {
	display: grid;
	grid-template-columns: repeat(4, 1fr);
	grid-gap: 40px 30px;
	margin-top: 70px;
}
.content-text {
	text-align: center;
	font-size: 18px;
}
.custom-buttons {
	display: flex;
	justify-content: center;
}
.custom-buttons > .button {
	min-width: 150px;
	width: max-content;
	height: 39px;
	line-height: 39px;
	border-radius: 7px;
	margin-right: 8px;
}
.custom-buttons > .button:last-child {
	margin-right: 0;
}
.custom-buttons > .no-btn {

}
.custom-buttons > .yes-btn {

}

.empty-text {
	margin-top: 34px;
	margin-bottom: 34px;
	text-align: center;
	color: var(--gray-3);
}
.gnr-btn {
	max-width: 200px;
	margin: 0 auto;
}

@media only screen and (max-width: 1200px) {
	.palettes {
		grid-template-columns: repeat(3, 1fr);
	}
}

@media only screen and (max-width: 1023px) {
	.palettes {
		grid-template-columns: repeat(2, 1fr);
	}
}

@media only screen and (max-width: 600px) {
	.palettes {
		grid-template-columns: repeat(1, 1fr);
	}
}
@media only screen and (max-width: 420px) {
	.custom-buttons {
		flex-direction: column;
	}
	.custom-buttons > .button {
		width: 100%;
		margin-right: 0;
		margin-bottom: 10px;
	}
	.custom-buttons > .button:last-child {
		margin-bottom: 0;
	}
}
</style>
