<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue?: string
  label?: string
}>(), {
  modelValue: '#0066ff',
  label: 'Choose color',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  done: []
}>()

const inputId = useId()
const isOpen = ref(false)
const textValue = ref(props.modelValue)

const normalizedColor = computed(() => {
  const value = textValue.value.trim()
  const shortHex = /^#([\da-f])([\da-f])([\da-f])$/i.exec(value)

  if (shortHex) {
    return `#${shortHex.slice(1).map(part => part + part).join('')}`
  }

  return /^#[\da-f]{6}$/i.test(value) ? value : '#0066ff'
})

watch(() => props.modelValue, (value) => {
  textValue.value = value
})

watch(isOpen, (open) => {
  if (!open) emit('done')
})

function updateColor(value: string) {
  textValue.value = value
  emit('update:modelValue', value)
}

function commitTextValue() {
  const value = normalizedColor.value
  textValue.value = value
  emit('update:modelValue', value)
}
</script>

<template>
  <Popover v-model:open="isOpen">
    <PopoverTrigger as-child>
      <slot name="trigger" :color="normalizedColor">
        <button
          type="button"
          class="color-picker-trigger"
          :style="{ backgroundColor: normalizedColor }"
          :aria-label="label"
        />
      </slot>
    </PopoverTrigger>
    <PopoverContent class="w-64" align="center">
      <div class="flex flex-col gap-3">
        <label class="text-sm font-medium" :for="inputId">{{ label }}</label>
        <input
          :id="inputId"
          class="h-28 w-full cursor-pointer rounded-lg border border-input bg-transparent p-1"
          type="color"
          :value="normalizedColor"
          @input="updateColor(($event.target as HTMLInputElement).value)"
        >
        <Input
          v-model="textValue"
          aria-label="Hex color"
          maxlength="7"
          @blur="commitTextValue"
          @keyup.enter="commitTextValue"
        />
      </div>
    </PopoverContent>
  </Popover>
</template>

<style scoped>
.color-picker-trigger {
  display: block;
  width: 30px;
  height: 30px;
  padding: 0;
  border: 0;
  border-radius: 7px;
  box-shadow: 0 0 1px 1px rgb(0 0 0 / 10%);
  cursor: pointer;
}
</style>
