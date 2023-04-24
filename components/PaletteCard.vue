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
        <div class="palette-info">
            <span class="palette-name"></span>
            <div class="options">
                <div class="option unsave" @click="$emit('unsave', item.palette)">
                    <v-tooltip
                        open-delay="200"
                        activator="parent"
                        location="top"
                    >Delete</v-tooltip>
                    <span class="material-icons-outlined icon">delete</span>
                </div>
                <div class="option copy" @click="$emit('copyURL', item.palette)">
                    <v-tooltip
                        open-delay="200"
                        activator="parent"
                        location="top"
                    >Copy URL</v-tooltip>
                    <span class="material-icons-outlined icon">copy</span>
                </div>
                <div class="option open">
                    <v-tooltip
                        open-delay="200"
                        activator="parent"
                        location="top"
                    >Open palette</v-tooltip>
                    <NuxtLink :to="`/palette/${item.palette}`" target="_blank">
                        <span class="material-icons-outlined icon">open_in_new</span>
                    </NuxtLink>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
const emit = defineEmits(['copied', 'copyURL', 'unsave']);
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
    z-index: 3;
}
.color:hover .code {
	opacity: 1;
}

.palette-info {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 0 15px;
    margin-top: 8px;
}
.palette-name {

}
.options {
    display: flex;
    align-items: center;
}
.option {
    display: flex;
    align-items: center;
    margin-left: 6px;
    cursor: pointer;
}
.option:first-child {
    margin-left: 0;
}
.option span {
    font-size: 20px;
    color: #7d7c83;
    transition: color var(--time-02) ease;
}
.option > a {
    display: flex;
    align-items: center;
    text-decoration: none;
}
.option:hover span {
    color: var(--text-black);
}
.option.unsave .icon {
    font-size: 24px;
}
.option.copy .icon {

}
.option.open .icon {
    font-size: 22px;
}
</style>