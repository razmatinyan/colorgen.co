<template>
	<div
	class="color"
	:class="{
		'dark-color': $chroma(props.color).luminance() >= 0.5,
		'light-color': $chroma(props.color).luminance() <= 0.5,
	}"
	:style="{
		'background-color': props.color,
		'color': $chroma(props.color).luminance() >= 0.5 ? 'var(--text-black)' : '#fff'
	}"
	:id="Date.now() + '-' + props.color.substring(1)"
	>
		<div class="options">

			<div class="color-option open-in-new">
				<div class="option-in" @click="$emit('openInNew', props.color)">
					<v-tooltip
						open-delay="600"
						activator="parent"
						location="top"
					>Open in palette generator</v-tooltip>
					<span class="material-icons-outlined">open_in_new</span>
				</div>
			</div>

			<div class="color-option copy">
				<div class="option-in" @click="copy(), $emit('copy', props.color)">
					<v-tooltip
						open-delay="600"
						activator="parent"
						location="top"
					>Copy</v-tooltip>
					<span class="material-icons-outlined">content_copy</span>
				</div>
			</div>

			<div class="color-option current-color">
				<span 
					class="color-code"
				>
					{{ $chroma(props.color).hex() }}
				</span>
			</div>

		</div>
	</div>
</template>

<script setup>
const { $chroma } = useNuxtApp();
const emit = defineEmits(['copy', 'openInNew']);
const props = defineProps({
	color: {
		type: String,
		default: '#0066ff'
	},
	modelValue: {
		type: String
	},
});

function copy() {
	navigator.clipboard.writeText(props.color);
}
</script>

<style scoped>
.color {
	width: auto;
	height: 100%;
	flex-basis: 100%;
	overflow: hidden;
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

.color .options > .color-option:not(.color-option.current-color) {
	opacity: 0;
	visibility: hidden;
	transition: opacity var(--time-02), visibility var(--time-02);
}
.color:hover .options > .color-option:not(.color-option.current-color) {
	opacity: 1;
	visibility: visible;
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
	user-select: none;
}

.light-color .options .option-in:hover {
	background: rgba(255, 255, 255, 0.06);
}
.dark-color .options .option-in:hover {
	background: rgba(0, 0, 0, 0.06);
}

.light-color.color .options .option-in:active { 
	background: rgba(255, 255, 255, 0.1);
}
.dark-color.color .options .option-in:active {
	background: rgba(0, 0, 0, 0.1);
}

.options .color-code {
	display: inline-block;
	padding: 6px 10px;
	border-radius: 10px;
	transition: background var(--time-02);
}
</style>