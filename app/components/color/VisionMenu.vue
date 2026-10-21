<script setup lang="ts">
import { isVisionType, visionInfo, visionTypes, type VisionType } from '~/lib/color'

const model = defineModel<VisionType>({ required: true })

const announcement = ref('')
watch(model, (type) => {
	announcement.value =
		type === 'normal' ? 'Showing colors with normal vision' : `Showing colors as ${visionInfo[type].people} see them`
})

function select(value: string) {
	if (isVisionType(value)) model.value = value
}
</script>

<template>
	<Tooltip>
		<TooltipTrigger as-child>
			<span class="inline-flex">
				<DropdownMenu :modal="false">
					<DropdownMenuTrigger as-child>
						<Button
							variant="outline"
							size="sm"
							class="aria-expanded:bg-muted"
							:aria-label="`Simulate color blindness: ${visionInfo[model].label}`"
						>
							<Icon :name="model === 'normal' ? 'lucide:eye' : 'lucide:scan-eye'" data-icon="inline-start" />
							<span class="hidden sm:inline">{{ visionInfo[model].label }}</span>
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" class="w-80">
						<DropdownMenuLabel class="text-muted-foreground">See colors as</DropdownMenuLabel>
						<DropdownMenuRadioGroup :model-value="model" @update:model-value="(value) => select(String(value))">
							<DropdownMenuRadioItem v-for="type in visionTypes" :key="type" :value="type">
								<span class="grid gap-0.5">
									<span>{{ visionInfo[type].label }}</span>
									<span class="text-xs text-muted-foreground">{{ visionInfo[type].description }}</span>
								</span>
							</DropdownMenuRadioItem>
						</DropdownMenuRadioGroup>
					</DropdownMenuContent>
				</DropdownMenu>
				<span class="sr-only" aria-live="polite">{{ announcement }}</span>
			</span>
		</TooltipTrigger>
		<TooltipContent>Simulate color blindness <Kbd>V</Kbd></TooltipContent>
	</Tooltip>
</template>
