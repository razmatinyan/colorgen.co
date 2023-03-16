<template>
    <Loader v-if="loader" />
    <section id="home">
        <div class="container row">
            <div class="hero-left">
                <div class="in">
                    <h1 class="main-title">
                        Generate Your Color Palettes
                    </h1>
                    <p class="hero-description">
                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Enim perspiciatis minima illo soluta vero adipisci totam minus fugiat. Ab iste odit expedita perferendis, aliquam tenetur blanditiis corporis eum saepe animi.
                    </p>
                    <div class="buttons">
                        <button class="btn btn-medium btn-padding-40 btn-blue">Generate Palettes</button>
                        <button class="btn btn-medium btn-padding-40 btn-border">Random Palettes</button>
                        <div class="input-wrapper">
                            <input 
                                type="text" 
                                id="hero-input" 
                                class="hero-input full"
                                placeholder="Paste your color here..."
                                tabindex="-1"
                                v-model="color">
                            <button 
                                class="input-button"
                                @click="clickHandler()"
                                v-html="startText"
                                ></button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="hero-right">
                <img src="@/assets/home/hero-photo.svg" alt="">
            </div>
        </div>
    </section>
</template>

<style scoped>
#home {
    height: 600px;
    padding-top: 150px;
}
#home > .container {
    height: 100%;
    align-items: center;
}
.hero-left {
    width: 100%;
}
.hero-left > .in {
    max-width: 430px;
}
.main-title {
    font-size: var(--font-clamp);
}
.title-line {
    display: block;
}
.hero-description {
    margin-bottom: 34px;
    color: var(--gray-3);
}
.buttons {
    
}
.buttons > button {
    margin-bottom: 14px;
}
.buttons > button:last-child {
    margin-bottom: 0;
}
.input-wrapper {
    position: relative;
}
.input-wrapper > input {
    
}
.input-wrapper > input:focus {
    outline: var(--blue);
    outline-offset: 3px;
    outline-width: 1px;
    outline-style: solid;
}
.input-wrapper > .input-button {
    position: absolute;
    top: 4px;
    right: 4px;
    min-width: 99px;
    height: 38px;
    line-height: 34px;
    padding: 0 18px;
    color: #fff;
    text-align: center;
    background: var(--green);
    border: none;
    border-radius: 6px;
    outline: none;
    cursor: pointer;
    transition: background var(--time-01);
}
.input-wrapper > .input-button:hover {
    background: var(--green-hover);
}
.hero-right {
    position: absolute;
    top: 50%;
    transform: translate(0, -50%);
    right: -120px;
    display: block;
    width: 840px;
    z-index: -1;
}
.hero-right > img {
    width: 100%;
    user-select: none;
    pointer-events: none;
}
</style>

<script setup>
const color = ref('');
const colors = ref([]);
let loader = ref(true);
let startText = ref('Start!');

async function getPalette(argColor) {
    const { data } = await useFetch(() => `/api/getdata/`, {
        params: {
            color: argColor ?? color
        }
    });
    colors.value.length = 0;
    colors.value.push(JSON.parse(data.value.response).colors);
    console.log(colors.value);
    return colors;
}

function randomPalette(count) {
    colors.value.length = 0;
    const newPalette = [
        '#' + Math.random().toString(16).slice(2, 8).toUpperCase(),
        '#' + Math.random().toString(16).slice(2, 8).toUpperCase(),
        '#' + Math.random().toString(16).slice(2, 8).toUpperCase(),
        '#' + Math.random().toString(16).slice(2, 8).toUpperCase(),
        '#' + Math.random().toString(16).slice(2, 8).toUpperCase()
    ];
    colors.value.push(newPalette);
    return colors.value;
}

function clickHandler() {
    startText.value = '<div class="spinner"></div>';
    console.log(111);
}

onMounted(() => {
    setTimeout(() => loader.value = false, 1000)
});

</script>