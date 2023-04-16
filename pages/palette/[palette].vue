<template>
    <article id="palette">

        <div class="palette-wrapper">
            <div class="palette-menu">

                <div class="menu-item menu-color">
                    <label for="count" class="input-label">Count</label>
                    <div class="inputs">
                        <input 
                            type="number" 
                            id="count" 
                            class="color-input"
                            v-model="count"
                        >
                        <span class="count-arrow count-plus" @click="count++">
                            <span class="material-icons-outlined">keyboard_arrow_up</span>
                        </span>
                        <span class="count-arrow count-minus" @click="count--">
                            <span class="material-icons-outlined">keyboard_arrow_down</span>
                        </span>
                    </div>
                </div>

                <div class="menu-item method">
                    <Select 
                        ref="selectChild"
                        :options="schemes"
                        @select="selectedScheme($event)"
                        :selected="selected"
                        :customOptions="['Auto']"
                        v-click-outside="handleClickOutside"
                    />
                </div>
				
				<div class="menu-item seperator">
					<span></span>
				</div>

                <div class="menu-item random-button">
                    <v-tooltip
                        open-delay="0"
                        activator="parent"
                        location="top"
                    >Press "Spacebar" to generate palettes</v-tooltip>
                    <button id="random-btn" @click="generateRandomPalette" class="btn btn-medium btn-blue btn-min-width-200">Generate</button>
                </div>

				<div class="menu-item seperator">
					<span></span>
				</div>

                <div class="menu-item download">
                    <button class="btn btn-medium btn-border btn-flex btn-with-icon" @click="handleDownload">
                        Export
                        <span class="material-icons-outlined btn-icon">file_download</span>
                    </button>
                </div>

                <div class="menu-item copy-url">
                    <button class="btn btn-medium btn-border btn-flex btn-with-icon" @click="handleCopyURL">
                        Copy URL
                        <span class="material-icons-outlined btn-icon">link</span>
                    </button>
                </div>

            </div>

            <v-app>
                <draggable
                    class="colors"
                    v-model="state.paletteArray"
                    item-key="id"
                    @start="$event.item.style.opacity = 0, setCursor()"
                    @end="$event.item.style.opacity = 1, removeCursor()"
                    @update="changeRoute"
                    forceFallback="true"
                    direction="horizontal"
                    dragClass="dragging"
                    handle=".sort-handler"
                    animation="200"
                >
                    <template #item="{ color, index }">
                        <PaletteColors
                            v-model:modelValue="state.paletteArray[index]"
                            :default="color"
                            :key="index"
                            :color="state.paletteArray[index]"
                            :number="index"
							:lock="lockedColors.includes(state.paletteArray[index])"
                            @color-change="setNewValue(index, $event)"
                            @delete="deleteColor(state.paletteArray[index])"
                            @done="changeRoute"
                            @copied="showToast('You copied this color: ', 'info', $event)"
                            @lock="handleLock($event)"
                        />
                    </template>
                </draggable>
            </v-app>
        </div>

        <Teleport to="body">
            <Toast ref="toast" />
        </Teleport>

    </article>
</template>

<script setup>
import draggable from 'vuedraggable'

const route = useRoute();
const { data } = await useFetch(`/api/palette/${route.params.palette}`);
const { $chroma } = useNuxtApp();
const config = useRuntimeConfig();

const palette = data.value;
const state = reactive({
	paletteArray: palette.split('-').map(c => '#' + c),
});

const count = useColorCount(state.paletteArray.length);
const schemes = useHomeSchemes();
const selected = useState('selected', () => '');

const randomScheme = schemes.value[Math.floor((Math.random() * schemes.value.length))];
const scheme = useState('scheme', () => 'Auto');

const toast = ref(null);
const selectChild = ref(null);

const lockedColors = useState('locked', () => []);

onMounted(() => {
	document.addEventListener('keydown', handleSpaceBar);
});

onUnmounted(() => {
	document.removeEventListener('keydown', handleSpaceBar);
});

function handleSpaceBar(event) {
	if ( event.code === 'Space' ) generateRandomPalette();
}

function handleClickOutside() {
    if ( selectChild.value.showOptions === true ) {
        selectChild.value.showOptions = false
    }
}

function showToast(message, type, color) {
    toast.value.show(message, type, color);
}

function handleCopyURL() {
	copyURL(`${config.public.BASE_URL}${route.fullPath}`);
	toast.value.show('You copied the current palette URL.', 'info');
}

function handleLock(color) {
    if ( !lockedColors.value.includes(color) ) {
        lockedColors.value.push(color);
    } else {
        let cindex = lockedColors.value.indexOf(color)
		lockedColors.value.splice(cindex, 1);
    }
}

function selectedScheme(option) {
    selected.value = option

    if ( option === 'Auto' ) {
        scheme.value = 'Auto'
    } else {
        scheme.value = option
    }
}

function deleteColor(event) {
    if ( state.paletteArray.length !== 2 ) {
        state.paletteArray = state.paletteArray.filter(color => color !== event);
		lockedColors.value = lockedColors.value.filter(color => color !== event);
        count.value = state.paletteArray.length;
        changeRoute();
    }
}

function handleDownload() {
    downloadColors('.colors', 'palette');
}

function setCursor() {
    document.documentElement.style.cursor = 'grabbing';
}
function removeCursor() {
    document.documentElement.style.cursor = 'default';
}

function changeRoute() {
    const colors = state.paletteArray.map(c => c.substring(1)).join('-');

    if ( colors ) {
        navigateTo('/palette/'+colors);
    }
}

function generateRandomPalette() {

	if ( state.paletteArray.length === lockedColors.value.length && state.paletteArray.length === count.value ) {

		showToast('You locked all colors!', 'error');

	} else {
		
		let schemeRes = '';
	
		if ( scheme.value === 'Auto' ) {
			schemeRes = schemes.value[Math.floor((Math.random() * schemes.value.length))];
		} else {
			schemeRes = scheme.value; 
		}
	
		if ( count.value <= 0 ) count.value = 5
		else if ( count.value >= 10 ) count.value = 10
	
		let colors;
		const randomType = scheme.value === 'Auto' ? randomNumber(1, 2) : 1;
		
		if ( randomType === 1 ) {
	
			let inputColor = $chroma.random().hex();
			colors = generatePalette(inputColor, schemeRes, count.value);
	
		} else if ( randomType === 2 ) {
	
			colors = new Array();
			for( let i = 1; i <= count.value; i++ ) {
				colors.push($chroma.random().hex());
			}
	
		}
	
		if ( lockedColors.value.length > 0 ) {
	
			state.paletteArray.forEach((clr, idx) => {
	
				if ( lockedColors.value.includes(clr) ) {
					colors[idx] = clr;
				}
	
			});
	
		}
	
		colors = colors.map(c => c.substring(1)).join('-');
	
		navigateTo('/palette/'+colors);

	}


}

function setNewValue(index, value) {
	let lockedIndex;
	if ( lockedColors.value.indexOf(state.paletteArray[index]) !== -1 ) {
		lockedIndex = lockedColors.value.indexOf(state.paletteArray[index]);
	}
	
    state.paletteArray[index] = value
	lockedColors.value[lockedIndex] = value;
}

function randomNumber(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min)
}

function changePalette() {
    let first = firstColor.value !== '' ? $chroma(firstColor.value) : $chroma('#000');
    let second = secondColor.value !== '' ? $chroma(secondColor.value) : $chroma('#fff');
    let newColors = $chroma.scale([first, second]).colors(colorCount.value);
    let newPalette = newColors.map(c => $chroma(c).hex());
    paletteArray.value = newPalette;
}
</script>

<style scoped>
#palette {
    position: fixed;
    top: 82px;
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
</style>