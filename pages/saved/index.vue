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
                @unsave="handleUnsaveModal($event)"
            />
        </div>
        
        <Teleport to="body">
            <Toast :messages="messages" />

            <Modal ref="modal">
                <template #content>
                    <p class="content-text">
                        Are you sure you want to delete this palette?
                    </p>
                </template>

                <template #buttons>
                    <div class="custom-buttons">
                        <button class="button no-btn btn btn-medium btn-border" @click="modal.showContent = false">Cancel</button>
                        <button class="button yes-btn btn btn-medium btn-blue" @click="handleUnsave(deletePalette)">Delete</button>
                    </div>
                </template>
            </Modal>
        </Teleport>

    </section>
</template>

<script setup>
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
        modal.value.showContent = false;
        deletePalette.value = '';
    }
    else if ( res.status === 400 ) showToast('Something went wrong!', 'error');

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
.content-text {
    text-align: center;
    font-size: 18px;
}
.custom-buttons {
    display: flex;
    justify-content: center;
}
.custom-buttons > .button {
    width: max-content;
    height: 40px;
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
</style>
