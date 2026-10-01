<template>
	<div
	class="color"
	:class="{
		'dark-color': $chroma(props.color).luminance() >= 0.5,
		'light-color': $chroma(props.color).luminance() <= 0.5,
		'locked': isLocked,
	}"
	:style="{
		'background-color': props.color,
		'color': $chroma(props.color).luminance() >= 0.5 ? 'var(--text-black)' : '#fff'
	}"
	:id="number + '-' + props.color.substring(1)"
	>
		<div class="options">

			<div v-if="screenSize" class="color-option remove">
				<Tooltip>
					<TooltipTrigger as-child>
						<button type="button" class="option-in remove-handler" @click="$emit('delete')">
							<Icon name="lucide:x" />
						</button>
					</TooltipTrigger>
					<TooltipContent side="top">Remove</TooltipContent>
				</Tooltip>
			</div>

			<div v-if="screenSize" class="color-option open-in-new">
				<Tooltip>
					<TooltipTrigger as-child>
						<button type="button" class="option-in" @click="$emit('openInNew', props.color)">
							<Icon name="lucide:external-link" />
						</button>
					</TooltipTrigger>
					<TooltipContent side="top">Open in a new tab</TooltipContent>
				</Tooltip>
			</div>

			<div class="color-option sort">
				<Tooltip>
					<TooltipTrigger as-child>
						<button type="button" class="option-in sort-handler">
							<Icon :name="screenSize ? 'lucide:arrow-left-right' : 'lucide:move-diagonal-2'" />
						</button>
					</TooltipTrigger>
					<TooltipContent side="top">Move</TooltipContent>
				</Tooltip>
			</div>

			<div class="color-option copy">
				<Tooltip>
					<TooltipTrigger as-child>
						<button type="button" class="option-in" @click="copy(), $emit('copied', props.color)">
							<Icon name="lucide:copy" />
						</button>
					</TooltipTrigger>
					<TooltipContent side="top">Copy</TooltipContent>
				</Tooltip>
			</div>

			<div class="color-option lock">
				<Tooltip>
					<TooltipTrigger as-child>
						<button type="button" class="option-in" @click="toggleLock">
							<Icon :name="isLocked ? 'lucide:lock' : 'lucide:lock-open'" />
						</button>
					</TooltipTrigger>
					<TooltipContent side="top">{{ isLocked ? 'Unlock' : 'Lock' }}</TooltipContent>
				</Tooltip>
			</div>

			<div class="color-option current-color">

				<ColorPicker
					v-if="screenSize"
					:model-value="props.modelValue"
					@update:model-value="$emit('color-change', $event)"
					@done="$emit('done')"
				>
					<template #trigger>
						<span class="color-code">{{ $chroma(props.color).hex() }}</span>
					</template>
				</ColorPicker>
				<span 
					v-else
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
const emit = defineEmits(['color-change', 'copied', 'delete', 'done', 'lock', 'openInNew']);
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

const isLocked = ref(props.lock);
const screenSize = ref('');

watch(() => props.lock, value => {
	isLocked.value = value;
});

onMounted(() => {
	screenSize.value = window.innerWidth >= 1200
})

function copy() {
	copyURL(props.color);
}

function toggleLock() {
	isLocked.value = !isLocked.value;
	emit('lock', props.color);
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
	border: 0;
	background: transparent;
	color: inherit;
	font: inherit;
}
.color-option > .option-in.sort-handler {
	cursor: grab;
}
.color.sortable-chosen .color-option > .option-in.sort-handler {
	cursor: grabbing;
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
	cursor: pointer;
	transition: background var(--time-02);
	user-select: none;
}
.light-color .options .color-code:hover {
	background: rgba(255, 255, 255, 0.1);
}
.dark-color .options .color-code:hover {
	background: rgba(0, 0, 0, 0.1);
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
	.options .option-in.sort-handler > :deep(svg) {
		transform: rotate(-45deg);
	}

	.light-color .options .option-in:hover {
		background: transparent;
	}
	.dark-color .options .option-in:hover {
		background: transparent;
	}

	.light-color .options .color-code:hover {
		background: transparent;
	}
	.dark-color .options .color-code:hover {
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
	.option-in :deep(svg) {
		font-size: 20px;
	}
	.options > .color-option:not(.current-color) {
		margin-left: 10px;
	}
}
</style>
