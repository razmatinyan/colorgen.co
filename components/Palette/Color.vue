<template>
	<div
	class="color"
	:class="{
		'dark-color': $chroma(props.color).luminance() >= 0.5,
		'light-color': $chroma(props.color).luminance() <= 0.5,
		'show': show,
		'locked': props.lock,
	}"
	:style="{
		'background-color': props.color,
		'color': $chroma(props.color).luminance() >= 0.5 ? 'var(--text-black)' : '#fff'
	}"
	:id="number + '-' + props.color.substring(1)"
	>
		<div class="options">

			<div v-if="screenSize" class="color-option remove">
				<div class="option-in remove-handler" @click="$emit('delete')">
					<v-tooltip
						transition="fade-transition"
						aria-label="Remove"
						open-delay="600"
						activator="parent"
						location="top"
					>Remove</v-tooltip>
					<span class="material-icons-outlined">close</span>
				</div>
			</div>

			<div v-if="screenSize" class="color-option open-in-new">
				<div class="option-in" @click="$emit('openInNew', props.color)">
					<v-tooltip
						transition="fade-transition"
						aria-label="Open in a new tab"
						open-delay="600"
						activator="parent"
						location="top"
					>Open in a new tab</v-tooltip>
					<span class="material-icons-outlined">open_in_new</span>
				</div>
			</div>

			<div class="color-option sort">
				<div class="option-in sort-handler">
					<v-tooltip
						transition="fade-transition"
						aria-label="Move"
						open-delay="600"
						activator="parent"
						location="top"
					>Move</v-tooltip>
					<span class="material-icons-outlined">{{ screenSize ? 'sync_alt' : 'open_in_full' }}</span>
				</div>
			</div>

			<div class="color-option copy">
				<div class="option-in" @click="copy(), $emit('copied', props.color)">
					<v-tooltip
						transition="fade-transition"
						aria-label="Copy"
						open-delay="600"
						activator="parent"
						location="top"
					>Copy</v-tooltip>
					<span class="material-icons-outlined">content_copy</span>
				</div>
			</div>

			<div class="color-option lock">
				<div class="option-in" @click="lock = !lock, $emit('lock', props.color)">
					<v-tooltip
						transition="fade-transition"
						aria-label="Lock/Unlock"
						open-delay="600"
						activator="parent"
						location="top"
					>{{ lock === true ? 'Unlock' : 'Lock' }}</v-tooltip>
					<span class="material-icons-outlined">{{ lock === true ? 'lock' : 'lock_open' }}</span>
				</div>
			</div>

			<div class="color-option current-color">

				<v-color-picker 
					v-if="screenSize"
					class="color-picker"
					:model-value="props.modelValue"
					:modes="['hex', 'rgb', 'hsl']"
					dot-size="20"
					@update:model-value="$emit('color-change', $event)"
				></v-color-picker>

				<span 
					v-if="screenSize"
					class="color-code" 
					@click="show = !show"
				>
					{{ $chroma(props.color).hex() }}
				</span>
				<span 
					v-else
					class="color-code" 
				>
					{{ $chroma(props.color).hex() }}
				</span>

				<div
					v-if="screenSize"
					class="overlay"
					@click="show = !show, $emit('done')"
				></div>

			</div>
		</div>
	</div>
</template>

<script setup>
const { $chroma } = useNuxtApp();
const props = defineProps({
	color: {
		type: String
	},
	modelValue: {
		type: String
	},
	number: {
		type: Number
	},
	lock: {
		type: Boolean,
		default: false
	}
});

const show = ref(false);
const screenSize = ref('');

onMounted(() => {
	screenSize.value = window.innerWidth >= 1200
})

function copy() {
	navigator.clipboard.writeText(props.color);
}
</script>

<style scoped>
.sortable-fallback {
	opacity: 1 !important;
}

.color {
	width: auto;
	height: 100%;
	flex-basis: 100%;
}

.options {
	position: relative;
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

.color .options > .color-option:not(.color-option.current-color, .locked .color-option.lock) {
	opacity: 0;
	visibility: hidden;
	transition: opacity var(--time-02), visibility var(--time-02);
}
.color:hover .options > .color-option:not(.color-option.current-color) {
	opacity: 1;
	visibility: visible;
}
.color.sortable-chosen .options > .color-option.sort:not(.color-option.current-color) {
	opacity: 1;
	visibility: visible;
}
.color.light-color.sortable-chosen .options > .color-option.sort .sort-handler {
	background-color: rgba(255, 255, 255, 0.1);
}
.color.dark-color.sortable-chosen .options > .color-option.sort .sort-handler {
	background-color: rgba(0, 0, 0, 0.1);
}

.color .color-option.lock .option-in {
	transition: transform var(--time-02) ease;
}
.color.locked .color-option.lock .option-in {
	transform: scale(1.2);
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
.color-option > .option-in.sort-handler {
	cursor: grab;
}
.color.sortable-chosen .color-option > .option-in.sort-handler {
	cursor: grabbing;
}
.light-color .options .option-in:hover,
.light-color.color.show .options .option-in {
	background: rgba(255, 255, 255, 0.06);
}
.dark-color .options .option-in:hover,
.dark-color.color.show .options .option-in {
	background: rgba(0, 0, 0, 0.06);
}

.light-color.color .options .option-in:active { 
	background: rgba(255, 255, 255, 0.1);
}
.dark-color.color .options .option-in:active {
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

.colors-10 .color:first-child .options .color-picker {
	left: 95%;
}
.colors-10 .color:last-child .options .color-picker {
	left: 5%;
}
.colors-9 .color:first-child .options .color-picker {
	left: 91%;
}
.colors-9 .color:last-child .options .color-picker {
	left: 9%;
}
.colors-8 .color:first-child .options .color-picker {
	left: 86%;
}
.colors-8 .color:last-child .options .color-picker {
	left: 13%;
}
.colors-7 .color:first-child .options .color-picker {
	left: 81%;
}
.colors-7 .color:last-child .options .color-picker {
	left: 18%;
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
	user-select: none;
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

@media only screen and (max-width: 1200px) {
	.options {
		flex-direction: row;
		align-items: center;
		height: 100%;
		margin-right: 10px;
		font-size: 1rem;
	}
	.options > .color-option {
		margin-top: 0;
		margin-left: 10px;
	}

	.color-option.current-color {
		position: absolute;
		left: 10px;
		margin-left: 0;
	}
	.color .options > .color-option:not(.color-option.current-color, .locked .color-option.lock) {
		opacity: 1;
		visibility: visible;
	}
	.options .option-in.sort-handler > span {
		transform: rotate(-45deg);
	}

	.light-color .options .option-in:hover,
	.light-color.color.show .options .option-in {
		background: transparent;
	}
	.dark-color .options .option-in:hover,
	.dark-color.color.show .options .option-in {
		background: transparent;
	}

	.light-color .options .color-code:hover,
	.light-color.color.show .options .color-code {
		background: transparent;
	}
	.dark-color .options .color-code:hover,
	.dark-color.color.show .options .color-code {
		background: transparent;
	}

	.colors-1 .color {
		height: 100%;
	}
	.colors-2 .color {
		height: 50%;
	}
	.colors-3 .color {
		height: 33.333%;
	}
	.colors-4 .color {
		height: 25%;
	}
	.colors-5 .color {
		height: 20%;
	}
	.colors-6 .color {
		height: 16.667%;
	}
	.colors-7 .color {
		height: 14.2857%;
	}
	.colors-8 .color {
		height: 12.5%;
	}
	.colors-9 .color {
		height: 11.1111%;
	}
	.colors-10 .color {
		height: 10%;
	}
}

@media only screen and (max-width: 480px) {
	.options {
		font-size: .9rem;
		margin-right: 14px;
	}
	.option-in .material-icons-outlined {
		font-size: 20px;
	}
	.options > .color-option:not(.current-color) {
		margin-left: 10px;
	}
}
</style>