<template>
    <div class="palette">
        <div class="colors">
            <div class="color"
                v-for="(color, index) in item.palette.split('-')"
                :key="index"
                :class="{
                    'dark-color': $chroma('#' + color).luminance() >= 0.5,
                    'light-color': $chroma('#' + color).luminance() <= 0.5,
                }"
                :style="{
                    'background-color': '#' + color,
                    'color': $chroma('#' + color).luminance() >= 0.5 ? 'var(--text-black)' : '#fff'
                }"
				@click="copy('#' + color)"
            >
                <span class="code">{{ '#' + color }}</span>
            </div>
        </div>
    </div>
</template>

<script setup>
const emit = defineEmits(['copied']);
const props = defineProps({
    item: {
        type: Object
    },
});

const { $chroma } = useNuxtApp();

function copy(color) {
    navigator.clipboard.writeText(color);
	emit('copied', color);
}
</script>

<style scoped>
.palette {
    position: relative;
	display: block;
}
.colors {
	display: flex;
	width: 100%;
	height: 130px;
	border-radius: 20px;
	overflow: hidden;
}
.color {
    position: relative;
	flex-basis: 1px;
	flex-grow: 1;
    box-shadow: inset rgba(0, 0, 0, 0.05) 0 1px, inset rgba(0, 0, 0, 0.05) 0 -1px;
    transition: all var(--time-01) ease;
    overflow: hidden;
	cursor: pointer;
}
.color:hover {
	flex-basis: 90px;
}
.code {
    position: absolute;
    top: 50%;
    display: block;
    width: 100%;
    text-align: center;
	text-transform: uppercase;
	font-weight: 500;
    opacity: 0;
	transform: translateY(-50%);
    transition: all var(--time-01) ease;
}
.color:hover .code {
	opacity: 1;
}
</style>