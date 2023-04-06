<template>
    <div
    class="color"
    :class="{ 'dark-color': $chroma(props.color).luminance() >= 0.5, 'light-color': $chroma(props.color).luminance() <= 0.5, 'show': show }"
    :style="{ 'background-color': props.color, 'color': $chroma(props.color).luminance() >= 0.5 ? '#000' : '#fff' }"
    :id="number + '-' + props.color.substring(1)"
    >
        <div class="options">

            <div class="color-option">
                <div class="option-in" @click="copy()">
                    <span class="material-icons-outlined">content_copy</span>
                </div>
            </div>

            <div class="color-option">

                <v-color-picker 
                    class="color-picker"
                    :model-value="props.modelValue"
                    :modes="['hex']"
                    dot-size="20"
                    @update:model-value="{
                        $emit('color-change', $event);
                    }"
                ></v-color-picker>

                <span 
                    class="color-code" 
                    @click="show = !show"
                >
                    {{ $chroma(props.color).hex() }}
                </span>

                <div 
                    class="overlay"
                    @click="show = !show"
                ></div>

            </div>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    color: {
        type: String
    },
    modelValue: {
        type: String
    },
    number: {

    }
});

const show = ref(false)

const { $chroma } = useNuxtApp();

function copy() {
    navigator.clipboard.writeText(props.color);
}
</script>

<style scoped>
.color {
    width: auto;
    height: 100%;
    flex-basis: 100%;
}
.options {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    height: calc(100% - 230px);
    font-size: 1.5rem;
    font-weight: 500;
}
.options > .color-option {
    position: relative;
    margin-top: 14px;
    text-align: center;
    text-transform: uppercase;
}
.options > .color-option:first-child {
    margin-top: 0;
}
.color-option > .option-in {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 5px;
    border-radius: 5px;
    width: max-content;
    height: 100%;
    margin: 0 auto;
    cursor: pointer;
    transition: background var(--time-02);
}
.light-color .options .option-in:hover,
.light-color.color.show .options .option-in {
    background: rgba(255, 255, 255, 0.1);
}
.dark-color .options .option-in:hover,
.dark-color.color.show .options .option-in {
    background: rgba(0, 0, 0, 0.1);
}
.options .color-picker {
    position: absolute;
    bottom: 60px;
    left: 50%;
    transform: translate(-50%, 30px);
    opacity: 0;
    visibility: hidden;
    transition: all var(--time-02);
    z-index: 3;
}
.color.show .options .color-picker {
    opacity: 1;
    visibility: visible;
    transform: translate(-50%, 0);
}
.options .color-code {
    display: inline-block;
    padding: 6px 10px;
    border-radius: 10px;
    cursor: pointer;
    transition: background var(--time-02);
}
.light-color .options .color-code:hover,
.light-color.color.show .options .color-code {
    background: rgba(255, 255, 255, 0.1);
}
.dark-color .options .color-code:hover,
.dark-color.color.show .options .color-code {
    background: rgba(0, 0, 0, 0.1);
}
.overlay {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 2;
}
.color.show .overlay {
    display: block;
}
</style>