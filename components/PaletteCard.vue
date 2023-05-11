<template>
	<div class="palette">
		<div class="colors">
			<PaletteCardColor
				v-for="(color, index) in item.palette.split('-')"
				:color="color"
				:key="index"
				:class="{
					'dark-color': $chroma('#' + color).luminance() >= 0.5,
					'light-color': $chroma('#' + color).luminance() <= 0.5,
				}"
				:style="{
					'background-color': '#' + color,
					'color': $chroma('#' + color).luminance() >= 0.5 ? 'var(--text-black)' : '#fff'
				}"
				@onCopy="copy('#' + color)"
			/>
		</div>
		<div class="palette-info">
			<span class="palette-name"></span>
			<div class="options">
				<div v-if="showDelete" class="option unsave" @click="$emit('unsave', item.palette)">
					<v-tooltip
						transition="fade-transition"
						aria-label="Delete"
						open-delay="200"
						activator="parent"
						location="top"
					>Delete</v-tooltip>
					<span class="material-icons-outlined icon">delete</span>
				</div>
				<div class="option copy" @click="$emit('copyURL', item.palette)">
					<v-tooltip
						transition="fade-transition"
						aria-label="Copy URL"
						open-delay="200"
						activator="parent"
						location="top"
					>Copy URL</v-tooltip>
					<span class="material-icons-outlined icon">copy</span>
				</div>
				<div class="option open">
					<v-tooltip
						transition="fade-transition"
						aria-label="Open Palette"
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
		type: [Object, Array]
	},
	showDelete: {
		type: Boolean,
		default: true
	}
});

const { $chroma } = useNuxtApp();
const showCheck = ref(false);
const checkIcon = '<span class="material-icons-outlined">done_all</span>';

function copy(color) {
	copyURL(color);
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