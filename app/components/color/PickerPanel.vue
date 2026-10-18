<script setup lang="ts">
import {
	formatColor,
	fromHsv,
	isInGamut,
	parseColor,
	pureHue,
	toHex,
	toHsv,
	type ColorFormat,
	type Hsv,
	type Oklch,
} from '~/lib/color'

const props = defineProps<{ color: Oklch }>()
const emit = defineEmits<{ update: [color: Oklch]; commit: [] }>()

type EyeDropperConstructor = new () => { open: () => Promise<{ sRGBHex: string }> }
type PickerPoint = { x: number; y: number }

const keyStep = 0.01
const largeKeyStep = 0.1

const plane = ref<HTMLElement>()
const hsv = ref(toHsv(props.color))
const isDragging = ref(false)
const eyeDropper = shallowRef<EyeDropperConstructor | null>(null)
const format = ref<ColorFormat>('hex')
const draft = ref('')
const isEditing = ref(false)
const isInvalid = ref(false)

const formats: { value: ColorFormat; label: string }[] = [
	{ value: 'hex', label: 'HEX' },
	{ value: 'rgb', label: 'RGB' },
	{ value: 'hsl', label: 'HSL' },
	{ value: 'oklch', label: 'OKLCH' },
]

watch(
	() => props.color,
	(color) => {
		hsv.value = toHsv(color, hsv.value)
	},
)

const point = computed<PickerPoint>(() => ({ x: hsv.value.s, y: 1 - hsv.value.v }))
const hex = computed(() => toHex(props.color))
const planeHue = computed(() => pureHue(hsv.value.h))
const valueText = computed(
	() => `Saturation ${Math.round(hsv.value.s * 100)}%, brightness ${Math.round(hsv.value.v * 100)}%`,
)

const hueModel = computed({
	get: () => hsv.value.h,
	set: (value) => update({ ...hsv.value, h: value }),
})
const hueTrack = `linear-gradient(to right, ${Array.from({ length: 13 }, (_, index) => pureHue(index * 30)).join(', ')})`

watch(
	[() => props.color, format],
	() => {
		if (!isEditing.value) {
			draft.value = formattedValue(props.color)
			isInvalid.value = false
		}
	},
	{ immediate: true },
)

onMounted(() => {
	eyeDropper.value = (window as Window & { EyeDropper?: EyeDropperConstructor }).EyeDropper ?? null
})

function clampUnit(value: number) {
	return Math.min(1, Math.max(0, value))
}

function formattedValue(color: Oklch) {
	const value = formatColor(color, format.value)
	return format.value === 'hex' ? value.toUpperCase() : value
}

function update(value: Hsv) {
	hsv.value = value
	emit('update', fromHsv(value))
}

function pick(target: PickerPoint) {
	update({ ...hsv.value, s: clampUnit(target.x), v: 1 - clampUnit(target.y) })
}

function pointFrom(event: PointerEvent): PickerPoint {
	const rect = plane.value!.getBoundingClientRect()
	return { x: (event.clientX - rect.left) / rect.width, y: (event.clientY - rect.top) / rect.height }
}

function onPointerDown(event: PointerEvent) {
	plane.value?.setPointerCapture(event.pointerId)
	plane.value?.focus()
	isDragging.value = true
	emit('commit')
	pick(pointFrom(event))
}

function onPointerMove(event: PointerEvent) {
	if (isDragging.value) pick(pointFrom(event))
}

function onPointerUp(event: PointerEvent) {
	isDragging.value = false
	if (plane.value?.hasPointerCapture(event.pointerId)) plane.value.releasePointerCapture(event.pointerId)
}

const keyDirections: Record<string, PickerPoint> = {
	ArrowLeft: { x: -1, y: 0 },
	ArrowRight: { x: 1, y: 0 },
	ArrowUp: { x: 0, y: -1 },
	ArrowDown: { x: 0, y: 1 },
}

function onKeydown(event: KeyboardEvent) {
	const direction = keyDirections[event.key]
	if (!direction) return
	event.preventDefault()
	const step = event.shiftKey ? largeKeyStep : keyStep
	emit('commit')
	pick({ x: point.value.x + direction.x * step, y: point.value.y + direction.y * step })
}

function onHueKeydown(event: KeyboardEvent) {
	if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End'].includes(event.key))
		emit('commit')
}

function applyDraft() {
	const parsed = parseColor(draft.value)
	isInvalid.value = !parsed
	if (!parsed) return
	if (toHex(parsed) !== hex.value || !isInGamut(parsed)) {
		emit('commit')
		emit('update', parsed)
	}
	draft.value = formattedValue(parsed)
}

function finishEditing() {
	applyDraft()
	isEditing.value = false
}

async function pickFromScreen() {
	if (!eyeDropper.value) return
	try {
		const { sRGBHex } = await new eyeDropper.value().open()
		const picked = parseColor(sRGBHex)
		if (!picked) return
		emit('commit')
		emit('update', picked)
	} catch {
		return
	}
}
</script>

<template>
	<div class="grid gap-4">
		<div
			ref="plane"
			role="slider"
			tabindex="0"
			aria-label="Saturation and brightness"
			:aria-valuetext="valueText"
			:aria-valuenow="Math.round(hsv.v * 100)"
			aria-valuemin="0"
			aria-valuemax="100"
			class="relative aspect-[8/5] w-full cursor-crosshair touch-none overflow-hidden rounded-xl ring-1 ring-foreground/10 outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/50"
			:style="{ backgroundColor: planeHue }"
			@pointerdown="onPointerDown"
			@pointermove="onPointerMove"
			@pointerup="onPointerUp"
			@pointercancel="onPointerUp"
			@keydown="onKeydown"
		>
			<span class="pointer-events-none absolute inset-0 bg-linear-to-r from-white to-transparent" aria-hidden="true" />
			<span class="pointer-events-none absolute inset-0 bg-linear-to-b from-transparent to-black" aria-hidden="true" />
			<span
				class="pointer-events-none absolute size-4 -translate-1/2 rounded-full shadow-md ring-2 ring-white outline-1 outline-black/25"
				:style="{ left: `${point.x * 100}%`, top: `${point.y * 100}%`, background: hex }"
				aria-hidden="true"
			/>
		</div>
		<input
			v-model.number="hueModel"
			type="range"
			min="0"
			max="360"
			step="0.1"
			aria-label="Hue"
			:aria-valuetext="`${Math.round(hsv.h)}°`"
			class="picker-hue h-4 w-full cursor-pointer appearance-none rounded-full bg-transparent outline-none"
			:style="{ '--picker-hue': hueTrack, '--picker-thumb': planeHue }"
			@pointerdown="emit('commit')"
			@keydown="onHueKeydown"
		/>
		<div class="flex items-center gap-2">
			<Tooltip>
				<TooltipTrigger as-child>
					<Button
						variant="outline"
						size="icon-sm"
						:disabled="!eyeDropper"
						aria-label="Pick a color from the screen"
						@click="pickFromScreen"
					>
						<Icon name="lucide:pipette" />
					</Button>
				</TooltipTrigger>
				<TooltipContent>{{
					eyeDropper ? 'Pick from the screen' : 'Screen picker is unavailable in this browser'
				}}</TooltipContent>
			</Tooltip>
			<Select v-model="format">
				<SelectTrigger size="sm" class="w-23 shrink-0" aria-label="Color format">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					<SelectItem v-for="item in formats" :key="item.value" :value="item.value">
						{{ item.label }}
					</SelectItem>
				</SelectContent>
			</Select>
			<Input
				v-model="draft"
				class="h-8 min-w-0 bg-background text-sm tabular-nums dark:bg-input/30"
				autocomplete="off"
				spellcheck="false"
				:aria-label="`${format.toUpperCase()} color value`"
				:aria-invalid="isInvalid || undefined"
				@focus="isEditing = true"
				@blur="finishEditing"
				@keydown.enter.prevent="applyDraft"
			/>
		</div>
	</div>
</template>

<style scoped>
.picker-hue::-webkit-slider-runnable-track {
	height: 0.75rem;
	border-radius: 9999px;
	background: var(--picker-hue);
	box-shadow: inset 0 0 0 1px var(--border);
}

.picker-hue::-moz-range-track {
	height: 0.75rem;
	border-radius: 9999px;
	background: var(--picker-hue);
	box-shadow: inset 0 0 0 1px var(--border);
}

.picker-hue::-webkit-slider-thumb {
	width: 1rem;
	height: 1rem;
	margin-top: -0.125rem;
	appearance: none;
	border-radius: 9999px;
	background: var(--picker-thumb);
	box-shadow:
		0 0 0 1.5px white,
		0 0 0 2.5px oklch(0 0 0 / 35%);
}

.picker-hue::-moz-range-thumb {
	width: 1rem;
	height: 1rem;
	border: 0;
	border-radius: 9999px;
	background: var(--picker-thumb);
	box-shadow:
		0 0 0 1.5px white,
		0 0 0 2.5px oklch(0 0 0 / 35%);
}

.picker-hue:focus-visible::-webkit-slider-thumb {
	box-shadow:
		0 0 0 1.5px white,
		0 0 0 4px color-mix(in oklch, var(--ring) 55%, transparent);
}

.picker-hue:focus-visible::-moz-range-thumb {
	box-shadow:
		0 0 0 1.5px white,
		0 0 0 4px color-mix(in oklch, var(--ring) 55%, transparent);
}
</style>
