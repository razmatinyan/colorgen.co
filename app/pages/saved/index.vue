<template>
	<div class="flex min-h-0 flex-1 flex-col lg:overflow-y-auto">
		<AppTopBar title="Library" title-as="p" />
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
			
			<AlertDialog v-model:open="deleteDialogOpen">
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete palette</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to delete this palette? This action cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction variant="destructive" @click="handleUnsave(deletePalette)">
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

		</section>
	</div>
</template>

<script setup>
definePageMeta({ layout: 'app' })
useHead({
	link: [
		{
			rel: 'canonical',
			href: 'https://colorgen.co/saved'
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
const deletePalette = ref('');
const deleteDialogOpen = ref(false);
const { showToast } = useAppToast();

function handleUnsaveModal(palette) {
	deletePalette.value = palette;
	deleteDialogOpen.value = true;
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

	deleteDialogOpen.value = false;
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
