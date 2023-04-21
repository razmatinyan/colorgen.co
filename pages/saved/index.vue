<template>
    <section id="saved" class="paddings">
        <h1 class="saved-title big-title text-center">
            Saved Palettes
        </h1>

        <div class="palettes">
            <PaletteCard 
                v-for="(item, index) in savedPalettes"
                :key="index"
                :item="item"
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
const savedPalettes = useCookie('saved-palettes');
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
    showToast(`You copied this color: ${color}`, 'info');
}
function handleCopyURL(palette) {
    navigator.clipboard.writeText('https://colorgen.co/palette/' + palette);

    showToast(`You copied palette URL`, 'info');
}

</script>

<style scoped>
#saved {
    padding-top: 70px;
}
.saved-title {
    margin-bottom: 70px;
}
.palettes {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-gap: 40px 30px;
    padding-bottom: 70px;
}
</style>
