<template>
	<section id="image-colors">
		<div class="container">
			<h1 class="image-title big-title text-center">Image Colors</h1>
			
			<p class="image-descr">
				Extract the color palette from your images with our Image Color Extractor tool.
			</p>

			<div class="dropzone-wrapper">
				<DropZone ref="inputRef" @drop.prevent="drop" @change="fileSelected" />
			</div>

			<div class="img-wrapper">
				<img
					v-if="imgSrc"
					:src="imgSrc"
					alt="Image"
					id="image" 
					crossorigin="Anonymous"
				>
			</div>
			
			<div class="palette-wrapper">
				<PaletteCard 
					v-if="colors.palette"
					:item="colors"
					:showDelete="false"
					@copied="handleToast($event)"
					@copyURL="handleCopyURL($event)"
				/>
			</div>
		</div>

		<Teleport to="body">
			<Toast :messages="messages" />
		</Teleport>
	</section>
</template>

<script setup>
import ColorThief from 'colorthief'

useHead({
	link: [
		{
			rel: 'canonical',
			href: 'https://colorgen.co/image-colors'
		},
	]
});

useSeoMeta({
	title: 'Extract Color Palette From The Image | colorgen.co',
	description: "Effortlessly extract color palette from your images with our Image Color Extractor tool. Enhance your design palette with the main colors of your photos. Try it now for free!",
	keywords: 'image color extractor, color palette, main colors, palette generator, generate palette, Colorgen',
	ogTitle: 'Extract Color Palette From The Image | colorgen.co',
	ogDescription: "Effortlessly extract color palette from your images with our Image Color Extractor tool. Enhance your design palette with the main colors of your photos. Try it now for free!",
	ogUrl: `https://colorgen.co/image-colors`,
})

const { $chroma } = useNuxtApp();
const imgSrc = ref('');
const colors = ref([]);
const inputRef = ref(null);
const messages = ref([]);
let dropzoneFile = ref('');

const drop = (e) => {
	dropzoneFile.value = e.dataTransfer.files[0];
	handleImageShow(dropzoneFile.value)
};

const fileSelected = () => {
	dropzoneFile.value = document.querySelector(".dropzoneFile").files[0];
	handleImageShow(dropzoneFile.value)
};

const handleImageShow = (file) => {

	if ( file.type !== 'image/jpeg' && file.type !== 'image/png' ) {
		showToast('Only JPG and PNG formats are allowed!', 'error');
		inputRef.value.btnText = 'Select File'
	} else {

		const colorThief = new ColorThief();
	
		const image = new Image();
		const fileReader = new FileReader();
	
		fileReader.onload = () => {
			image.onload = () => {
				const result = colorThief.getPalette(document.querySelector('#image'), 8);
	
				const paletteString = result
										.map(c =>  $chroma(`rgb(${c[0]}, ${c[1]}, ${c[2]})`).hex().substring(1))
										.join('-');
				
				colors.value = {
					palette: paletteString
				}
			};
			image.src = fileReader.result;
			imgSrc.value = image.src;

			setTimeout(() => {
				scrollToPalette();
				inputRef.value.btnText = 'Select File'
			}, 1)
		};
		fileReader.readAsDataURL(file);

	}
	inputRef.value.emptyFiles();
	
}

const scrollToPalette = () => {
	document.querySelector('.palette-wrapper').scrollIntoView({ behavior: 'smooth' })
}

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
#image-colors {
	padding-top: 70px;
}
.image-title {
	margin-bottom: 34px;
}
.image-descr {
	display: block;
	max-width: 900px;
	margin: 0 auto;
	margin-bottom: 50px;
	color: var(--gray-3);
	text-align: center;
}
.dropzone-wrapper {
	max-width: 600px;
	margin: 0 auto 50px auto;
}
.img-wrapper {
	max-width: 700px;
	margin: 0 auto 30px auto;
}
#image { 
	width: 100%;
	border-radius: 20px;
}
.palette-wrapper {
	max-width: 700px;
	margin: 0 auto;
}

@media only screen and (max-width: 769px) {
	#palette-static {
		padding-top: 56px;
	}
}
</style>