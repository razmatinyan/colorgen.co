<template>
    <section id="home">
        <div class="container row">
            <div class="hero-left">
                <h1 class="main-title">
                    Generate Your Color Palettes
                </h1>
                <p class="hero-description">
                    Lorem ipsum dolor sit amet consectetur adipisicing elit. Enim perspiciatis minima illo soluta vero adipisci totam minus fugiat. Ab iste odit expedita perferendis, aliquam tenetur blanditiis corporis eum saepe animi.
                </p>
                <div class="buttons">
                    <button class="btn btn-medium btn-padding-40 btn-blue">Generate Palettes</button>
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
}
#home > .container {
    height: 100%;
    align-items: center;
}
.hero-left {
    flex-basis: 30%;
}
.main-title {
    font-size: var(--font-clamp);
}
.title-line {
    display: block;
}
.hero-description {
    margin-bottom: 30px;
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

.hero-right {
    flex-basis: 70%;
    padding-left: 10%;
}
</style>

<script setup>
const color = ref('');
const colors = ref([]);

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

onMounted(() => {

});

</script>