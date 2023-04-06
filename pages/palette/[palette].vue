<template>
    <article id="palette">
        <div class="palette-wrapper">
            <div class="palette-menu">
                <div class="menu-item menu-color">
                    <label for="count">Colors Count</label>
                    <div class="inputs">
                        <input 
                            type="number" 
                            id="count" 
                            class="color-input"
                            v-model="count"
                        >
                    </div>
                </div>
                <div class="menu-item random-button">
                    <button id="random-btn" @click="generateRandomPalette" class="btn btn-medium btn-border btn-min-width-200">Random</button>
                </div>
            </div>

            <v-app>
                <div class="colors">
                    <Colors 
                        v-for="(color, index) in state.paletteArray"
                        :key="index"
                        :color="color"
                        :number="index"
                        v-model:modelValue="state.paletteArray[index]"
                        @color-change="setNewValue(index, $event)"
                    />
                </div>
            </v-app>
        </div>
    </article>
</template>

<script setup>
const route = useRoute();
const { data } = await useFetch(`/api/palette/${route.params.palette}`)
const { $chroma } = useNuxtApp();

const schemes = useHomeSchemes();
const count = useColorCount();

function generateRandomPalette() {

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

    navigateTo('/palette/'+colors);
}

function setNewValue(index, value) {
    state.paletteArray[index] = value
    console.log(state.paletteArray);
}

// function openColorPicker(event) {
//     const element = document.getElementById(event.target.id);
//     const currentPicker = element.previousSibling;
//     element.classList.toggle('active');
//     currentPicker.classList.toggle('show');
//     // currentPicker.getProperty("--v-color-picker-color-hsv");
//     const newColor = window.getComputedStyle(currentPicker).getPropertyValue('--v-color-picker-color-hsv');
// }

function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

const palette = data.value;
const state = reactive({
    paletteArray: palette.split('-').map(c => '#' + c)
});

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
    padding: 16px 30px;
    border-bottom: 1px solid #e5e5e5;
}
.menu-item {
    margin-right: 20px;
}
.menu-item:last-child {
    margin-right: 0;
}
.menu-color {
    position: relative;
}
.menu-color > label {
    display: block;
    color: var(--text-black);
    font-size: 13px;
    position: absolute;
    top: -9px;
    left: 13px;
    background: #fff;
    z-index: 2;
}
.menu-color > .inputs {
    position: relative;
}
.menu-color > .inputs > .color-input {
    max-width: 200px;
    text-align: center;
    padding: 0;
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

<!--
    :style="{ 'background-color': color, 'color': $chroma.contrast(color, 'white') >= $chroma.contrast(color, 'black') ? 'white' : 'black' }"


  -->