<template>
    <article id="gradient">

        <div class="palette-wrapper">
            <div class="palette-menu">

                <div class="menu-item menu-color menu-custom-color">
                    <label for="startColor" class="input-label">Start</label>
                    <div class="inputs">
                        <input 
                            type="text" 
                            id="startColor" 
                            class="custom-color-input"
                            placeholder="#C3D4EF"
                            v-model="startColor"
                        >

                        <span class="chosen-color" :style="{ 'background-color': startColor }"></span>

                        <transition name="picker">
                            <v-app v-if="showForColor">
                                <v-color-picker 
                                    class="color-picker"
                                    :model-value="startColor"
                                    :modes="['hex']"
                                    dot-size="20"
                                    @update:model-value="$event"
                                ></v-color-picker>
                            </v-app>
                        </transition>
                    </div>
                </div>

                <div class="menu-item menu-color menu-custom-color">
                    <label for="middleColor" class="input-label">Middle</label>
                    <div class="inputs">
                        <input 
                            type="text" 
                            id="middleColor" 
                            class="custom-color-input"
                            placeholder="#C3D4EF"
                            v-model="middleColor"
                        >

                        <span class="chosen-color" :style="{ 'background-color': middleColor }"></span>

                        <transition name="picker">
                            <v-app v-if="showForColor">
                                <v-color-picker 
                                    class="color-picker"
                                    :model-value="middleColor"
                                    :modes="['hex']"
                                    dot-size="20"
                                    @update:model-value="$event"
                                ></v-color-picker>
                            </v-app>
                        </transition>
                    </div>
                </div>

                <div class="menu-item menu-color menu-custom-color">
                    <label for="endColor" class="input-label">End</label>
                    <div class="inputs">
                        <input 
                            type="text" 
                            id="endColor" 
                            class="custom-color-input"
                            placeholder="#C3D4EF"
                            v-model="endColor"
                        >

                        <span class="chosen-color" :style="{ 'background-color': endColor }"></span>

                        <transition name="picker">
                            <v-app v-if="showForColor">
                                <v-color-picker 
                                    class="color-picker"
                                    :model-value="endColor"
                                    :modes="['hex']"
                                    dot-size="20"
                                    @update:model-value="$event"
                                ></v-color-picker>
                            </v-app>
                        </transition>
                    </div>
                </div>

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

                <div class="menu-item download flex-btn-mw">
                    <button class="btn btn-medium btn-border btn-flex btn-with-icon" @click="handleDownload">
                        Export
                        <span class="material-icons-outlined btn-icon">file_download</span>
                    </button>
                </div>

                <div class="menu-item save-menu flex-btn-mw">
                    <button class="btn btn-medium btn-border btn-flex btn-with-icon" @click="handleSave(palette, action)">
                        {{ action === 'set' ? 'Save' : 'Unsave' }}
                        <span class="material-icons-outlined btn-icon">{{ action === 'set' ? 'bookmark_border' : 'bookmark' }}</span>
                    </button>
                </div>
                
                <div class="menu-item copy-url flex-btn-mw">
                    <button class="btn btn-medium btn-border btn-flex btn-with-icon" @click="handleCopyURL">
                        Copy URL
                        <span class="material-icons-outlined btn-icon">link</span>
                    </button>
                </div>

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
const savedPalettes = useCookie('saved-palettes');

const gradient = data.value;
const state = reactive({
	gradient: gradient.split('-').map(c => '#' + c),
});

const startColor = useState('startColor', () => $chroma.random().hex());
const middleColor = useState('middleColor', () => '');
const endColor = useState('endColor', () => $chroma.random().hex());

const count = useState('gradientCount', () => '5');
const messages = ref([]);
</script>

<style scoped>
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
</style>