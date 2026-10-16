<script setup lang="ts" generic="T extends string">
defineProps<{
	options: readonly { value: T, label: string, icon?: string }[]
	label: string
}>()

const model = defineModel<T>({ required: true })
</script>

<template>
	<ToggleGroup
		:model-value="model"
		type="single"
		size="sm"
		:spacing="1"
		:aria-label="label"
		class="rounded-4xl bg-muted p-1"
		@update:model-value="value => value && (model = value as T)"
	>
		<ToggleGroupItem
			v-for="option in options"
			:key="option.value"
			:value="option.value"
			class="h-7 text-muted-foreground hover:bg-transparent data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-xs dark:data-[state=on]:bg-input/50"
		>
			<Icon v-if="option.icon" :name="option.icon" /> {{ option.label }}
		</ToggleGroupItem>
	</ToggleGroup>
</template>
