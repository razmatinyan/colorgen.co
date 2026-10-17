<script setup lang="ts">
import { isInGamut, parseColor, toHex, type Oklch } from '~/lib/color'

const props = withDefaults(defineProps<{ color: Oklch, label: string, hint?: string, pickerLabel?: string }>(), { hint: 'Paste a HEX, RGB, HSL or OKLCH value.' })
const emit = defineEmits<{ change: [color: Oklch], update: [color: Oklch], commit: [] }>()

const inputId = useId()
const hintId = useId()
const hex = computed(() => toHex(props.color))
const draft = ref(hex.value.toUpperCase())
const isEditing = ref(false)
const isInvalid = ref(false)

watch(hex, (value) => {
	if (!isEditing.value) draft.value = value.toUpperCase()
})

function apply() {
	const parsed = parseColor(draft.value)
	isInvalid.value = !parsed
	if (!parsed) return
	if (toHex(parsed) !== hex.value || !isInGamut(parsed)) emit('change', parsed)
	draft.value = toHex(parsed).toUpperCase()
}

function onBlur() {
	apply()
	isEditing.value = false
}
</script>

<template>
	<form class="grid gap-2" @submit.prevent="apply">
		<label :for="inputId" class="text-sm font-medium">{{ label }}</label>
		<InputGroup class="bg-background dark:bg-input/30">
			<InputGroupAddon>
				<Popover>
					<PopoverTrigger as-child>
						<button
							type="button"
							class="size-6 shrink-0 rounded-full ring-1 ring-foreground/15 ring-inset outline-none transition-[background-color,transform] duration-150 hover:scale-110 focus-visible:ring-3 focus-visible:ring-ring/50 motion-reduce:transition-none"
							:style="{ background: hex }"
							:aria-label="pickerLabel ?? `Open color picker for ${label.toLowerCase()}`"
						/>
					</PopoverTrigger>
					<PopoverContent align="start" class="w-76">
						<ColorPickerPanel :color="color" @update="value => emit('update', value)" @commit="emit('commit')" />
					</PopoverContent>
				</Popover>
			</InputGroupAddon>
			<InputGroupInput
				:id="inputId"
				v-model="draft"
				class="tabular-nums"
				autocomplete="off"
				spellcheck="false"
				:aria-invalid="isInvalid || undefined"
				:aria-describedby="hintId"
				@focus="isEditing = true"
				@blur="onBlur"
			/>
		</InputGroup>
		<p :id="hintId" class="text-sm" :class="isInvalid ? 'text-destructive' : 'text-muted-foreground'">
			{{ isInvalid ? 'Enter a color like #1F6CB0 or rgb(31 108 176).' : hint }}
		</p>
	</form>
</template>
