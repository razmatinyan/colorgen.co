<template>
    <article id="palette">
        <div class="palette-wrapper">
            <input type="text" v-model="color">
            <div class="colors">
                <div
                v-for="color in paletteArray"
                :key="color"
                class="color"
                :style="{ 'background-color': color, 'color': $chroma(color).luminance() >= 0.5 ? '#000' : '#fff' }"
                >
                    {{ $chroma(color).name() }}
                </div>
            </div>
        </div>
    </article>
</template>

<script setup>
const { $chroma } = useNuxtApp();
let color = ref('');

const route = useRoute();
const { data } = await useFetch(`/api/palette/${route.params.palette}`)

const palette = data.value;
const paletteArray = palette.split('-').map(c => '#' + c);

onMounted(() => {
    color.value = localStorage.getItem('fromColor') ? localStorage.getItem('fromColor') : '';
})
</script>

<style scoped>
#palette {
    position: fixed;
    top: 82px;
    left: 0;
    width: 100%;
    height: 100%;
}
.palette-wrapper {
    height: 100%;
}
.colors {
    display: flex;
    width: 100%;
    height: 100%;
}
.color {
    width: auto;
    height: 100%;
    flex-basis: 100%;
}
</style>

<!--
    :style="{ 'background-color': color, 'color': $chroma.contrast(color, 'white') >= $chroma.contrast(color, 'black') ? 'white' : 'black' }"


  -->