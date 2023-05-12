<template>
	<article id="gradient">

		<div class="palette-wrapper">
			<div class="palette-menu">

				<GradientMenuPicker 
					class="first-color"
					:label="'Start Color'"
					v-model:item="startColor"
					@update:item="startColor = $event"
					@color-change="changeGradient"
					@done="changeRoute"
				/>

				<GradientMenuPicker 
					class="second-color"
					:label="'End Color'"
					v-model:item="endColor"
					@update:item="endColor = $event"
					@color-change="changeGradient"
					@done="changeRoute"
				/>

				<div class="menu-item menu-color menu-count">
					<label for="count" class="input-label">Count</label>
					<div class="inputs">
						<input 
							type="number" 
							id="count" 
							class="color-input"
							v-model="count"
						>
						<span class="count-arrow count-plus" @click="handleCountChange('plus')">
							<span class="material-icons-outlined">keyboard_arrow_up</span>
						</span>
						<span class="count-arrow count-minus" @click="handleCountChange('minus')">
							<span class="material-icons-outlined">keyboard_arrow_down</span>
						</span>
					</div>
				</div>

				<div class="menu-item download flex-btn-mw">
					<button class="btn btn-medium btn-border btn-flex btn-with-icon" @click="handleDownload">
						<span class="text">Export</span>
						<span class="material-icons-outlined btn-icon">file_download</span>
					</button>
				</div>

				<div class="menu-item save-menu flex-btn-mw">
					<button class="btn btn-medium btn-border btn-flex btn-with-icon" @click="handleSave(state.colors, action)">
						<span class="text">{{ action === 'set' ? 'Save' : 'Unsave' }}</span>
						<span class="material-icons-outlined btn-icon">{{ action === 'set' ? 'bookmark_border' : 'bookmark' }}</span>
					</button>
				</div>
				
				<div class="menu-item copy-url flex-btn-mw">
					<button class="btn btn-medium btn-border btn-flex btn-with-icon" @click="handleCopyURL">
						<span class="text">Copy URL</span>
						<span class="material-icons-outlined btn-icon">link</span>
					</button>
				</div>

			</div>

			<div class="colors" :class="'colors-' + count">
				<GradientColor
					v-for="(color, index) in state.colors"
					:key="index"
					v-model:modelValue="state.colors[index]"
					:color="color"
					@copy="handleCopy($event)"
					@openInNew="OpenInNewTab($event)"
				/>
			</div>
		</div>

		<Teleport to="body">
			<Toast 
				:messages="messages"
			/>
			
			<div 
				class="overlay"
			></div>
		</Teleport>

	</article>
</template>

<script setup>
const route = useRoute();
const { data } = await useFetch(`/api/gradient/${route.params.gradient}`);
const { $chroma } = useNuxtApp();
const config = useRuntimeConfig();
const messages = ref([]);
const savedPalettes = useCookie('saved-palettes');

const gradient = data.value;
const newColors = ref([]);

const state = reactive({
	gradient: gradient.map((c) => c === '' ? c : '#' + c),
	colors: newColors.value
});

const action = ref('set');
if ( savedPalettes.value !== undefined ) {
	for( let saved in savedPalettes.value ) {
		if ( state.colors.map((c) => c.substring(1)).join('-') === savedPalettes.value[saved].palette ) {
			action.value = 'delete';
			break;
		}
	}
}

const startColor = useState('startColor', () => state.gradient[0]);
const endColor = useState('endColor', () => state.gradient[1]);

useHead({
	link: [
		{
			rel: 'canonical',
			href: `https://colorgen.co/gradient/${state.gradient[0].substring(1)}-${state.gradient[1].substring(1)}`
		},
	]
})

useSeoMeta({
	title: `Gradient Color Palette - ${state.gradient[0]}-${state.gradient[1]} | colorgen.co`,
	description: `Explore this stunning gradient color palette featuring shades between ${state.gradient[0]} and ${state.gradient[1]}. Explore the possibilities and unleash your creativity with this stunning color palette.`,
	keywords: 'Color Palette, Palette, Generator, Design, Color combination, Color Schemes, Colorgen',
	ogTitle: `Gradient Color Palette - ${state.gradient[0]}-${state.gradient[1]} | colorgen.co`,
	ogDescription: `Explore this stunning gradient color palette featuring shades between ${state.gradient[0]} and ${state.gradient[1]}. Explore the possibilities and unleash your creativity with this stunning color palette.`,
	ogUrl: `https://colorgen.co/gradient/${state.gradient[0].substring(1)}-${state.gradient[1].substring(1)}`,
})

const count = useState('gradientCount', () => '5');

async function handleSave(palette, saveAction) {
	const res = await $fetch('/api/saved/palettes', {
		method: 'POST',
		body: {
			palette: palette.map((c) => c.substring(1)).join('-'),
			action: saveAction
		}
	});

	if ( res.action === 'saved' ) {
		action.value = 'delete'
		showToast('Palette has been <a href="/saved">saved</a>', 'info');
	}
	else if ( res.action === 'unsaved' ) action.value = 'set'
	else if ( res.status === 400 ) showToast('Something went wrong!', 'error');
}

function changeGradient() {
	let first = startColor.value !== '' && $chroma.valid(startColor.value) === true ? $chroma(startColor.value) : $chroma('#000');
	let second = endColor.value !== '' && $chroma.valid(endColor.value) === true ? $chroma(endColor.value) : $chroma('#fff');
	newColors.value = $chroma.scale([first, second]).colors(count.value);
	state.colors = newColors.value
}
changeGradient()

function changeRoute() {
	if ( startColor.value !== '' ) {
		navigateTo(`/gradient/${startColor.value.substring(1).toLowerCase()}-${endColor.value.substring(1).toLowerCase()}`);
	}
}

function handleCountChange(action) {

	if ( action === 'plus' ) count.value++
	else if ( action === 'minus' ) count.value--

	if ( count.value <= 2 ) count.value = 2
	else if ( count.value >= 10 ) count.value = 10

	changeGradient()

}

function OpenInNewTab(color) {
	const schemes = useHomeSchemes();
	let schemeRes = schemes.value[Math.floor((Math.random() * schemes.value.length))];

	let colors = generatePalette(color, schemeRes, count.value);

	if ( schemeRes !== 'Monochromatic' && schemeRes !== 'Mono Light' && schemeRes !== 'Mono Dark' && schemeRes !== 'Analogous' ) {
		colors = shuffleArray(colors);
	}

	colors = colors.map(c => c.substring(1)).join('-');

	let link = document.createElement('a');
	link.href = `/palette/${colors}`
	link.setAttribute('target', '_blank');
	link.click();
}

function handleDownload() {
	downloadColors('.colors', 'gradient');
}

function handleCopyURL() {
	copyURL(`${config.public.BASE_URL}${route.fullPath}`);
	showToast('You copied current palette URL.', 'info');
}

function handleCopy(color) {
	messages.value.unshift(
		{
			id: Date.now().toLocaleString(),
			name: `You copied this color: ${color.toUpperCase()}`,
			type: 'info'
		}
	);
}

function showToast(message, type) {
	messages.value.unshift(
		{
			id: Date.now().toLocaleString(),
			name: message,
			type: type
		}
	);
}
</script>

<style>
#gradient {
	position: fixed;
	top: 70px;
	left: 0;
	width: 100%;
	height: 100%;
	z-index: 1;
}
.palette-wrapper {
	height: 100%;
}
.palette-menu {
	display: flex;
	justify-content: center;
	align-items: center;
	padding: 14px 30px;
	border-bottom: 1px solid #e5e5e5;
}

.menu-item {
	margin-right: 20px;
}
.menu-item:last-child {
	margin-right: 0;
}

.menu-item > button {
	height: 40px;
	line-height: 39px;
}
.menu-item.flex-btn-mw > button {
	min-width: 125px;
	justify-content: space-between;
}
.menu-item .btn-icon {
	font-size: 23px;
}

.menu-item.seperator > span[data-v-884bd382] {
	width: 1px;
	height: 30px;
	background: rgba(0, 0, 0, 0.1);
	user-select: none;
	pointer-events: none;
	display: block;
}

.menu-color {
	position: relative;
}
.menu-color > .input-label {
	display: block;
	color: var(--text-black);
	font-size: 12px;
	position: absolute;
	top: -8px;
	left: 28px;
	background: #fff;
	z-index: 2;
	user-select: none;
}
.menu-color.menu-custom-color > .input-label {
	left: 48%;
	transform: translateX(-50%);
}
.menu-custom-color .inputs .v-application {
	position: absolute;
	top: 48px;
}
.menu-custom-color .chosen-color {
	position: absolute;
	top: 5px;
	right: 6px;
	width: 30px;
	height: 30px;
	border-radius: 7px;
	box-shadow: 0 0 1px 1px rgba(0,0,0,0.1);
	cursor: pointer;
}

.overlay {
	display: none;
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	z-index: 3;
}

.picker-enter-from,
.picker-leave-to {
	transform: translateY(-30px);
	opacity: 0;
}
.picker-enter-to {
	transform: translateY(0);
	opacity: 1;
}
.picker-enter-active,
.picker-leave-active {
	transition: all .2s ease;
}

.menu-color > .inputs {
	position: relative;
}
.menu-color > .inputs > .color-input {
	max-width: 100px;
	text-align: center;
	padding: 0 7px 0 0;
	height: 40px;
	line-height: 39px;
}
.menu-color > .inputs > .custom-color-input {
	max-width: 150px;
	height: 40px;
	line-height: 39px;
}
.menu-color .count-arrow {
	position: absolute;
	display: block;
	right: 0;
	height: 20px;
	cursor: pointer;
	border: 1px solid var(--gray);
	transition: border var(--time-02);
	user-select: none;
}
.menu-color .count-arrow:hover {
	border-color: var(--black);
}
.menu-color .count-arrow.count-plus {
	top: 0;
	border-top-right-radius: 10px;
	border-bottom-color: transparent;
}
.menu-color .count-arrow.count-plus:hover {
	border-bottom-color: var(--black);
}
.menu-color .count-arrow.count-minus {
	bottom: 0;
	border-bottom-right-radius: 10px;
}
.menu-color .count-arrow > span {
	font-size: 20px;
}

.menu-color > .inputs > .color-picker {
	position: absolute;
	top: 100%;
	margin-top: 10px;
}
.menu-color > .inputs > .picker-btn {
	position: absolute;
	top: 4px;
	right: 4px;
	width: 38px;
	height: 38px;
	border-radius: 8px;
	cursor: pointer;
}

.colors {
	display: flex;
	width: 100%;
	height: 100%;
}


@media only screen and (max-width: 1200px) {
	#palette {
		overflow-y: auto;
	}
	.colors {
		display: block;
	}
	.palette-wrapper {
		height: calc(100% - 128px);
		overflow-y: auto;
	}

	/* Menu */
	.palette-menu {
		position: fixed;
		left: 0;
		bottom: 0;
		width: 100%;
		justify-content: flex-end;
		padding: 10px;
		z-index: 2;
		background: #fff;
		box-shadow: rgba(0, 0, 0, 0.075) 0 -1px;
	}
	.menu-item {
		margin-right: 10px;
	}
	.menu-count,
	.method,
	.seperator {
		display: none;
	}
	.menu-item .text {
		display: none;
	}
	.menu-item.flex-btn-mw > button {
		min-width: auto;
		justify-content: space-between;
	}
	.btn-with-icon {
		padding: 0 7px;
	}
	.btn-icon {
		margin-left: 0;
	}
	.menu-item > button {
		height: 36px;
		line-height: 35px;
	}

	.menu-custom-color .inputs .v-application {
		position: fixed;
		top: auto;
		left: 10px;
		bottom: 71px;
		height: auto;
	}
	/* Menu */
}
@media only screen and (max-width: 769px) {
	#gradient {
		top: 56px;
	}
	.palette-wrapper {
		height: calc(100% - 114px);
	}
}
</style>