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
				<AppTooltip v-if="showDelete" text="Delete">
					<button type="button" class="option unsave" @click="$emit('unsave', item.palette)">
						<Icon name="lucide:trash-2" class="icon" />
					</button>
				</AppTooltip>
				<AppTooltip text="Copy URL">
					<button type="button" class="option copy" @click="$emit('copyURL', item.palette)">
						<Icon name="lucide:copy" class="icon" />
					</button>
				</AppTooltip>
				<AppTooltip text="Open palette">
					<NuxtLink class="option open" :to="`/palette/${item.palette}`" target="_blank">
						<Icon name="lucide:external-link" class="icon" />
					</NuxtLink>
				</AppTooltip>
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
	border: 0;
	background: transparent;
}
.option:first-child {
	margin-left: 0;
}
.option :deep(svg) {
	font-size: 20px;
	color: #7d7c83;
	transition: color var(--time-02) ease;
}
.option > a {
	display: flex;
	align-items: center;
	text-decoration: none;
}
.option:hover :deep(svg) {
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
