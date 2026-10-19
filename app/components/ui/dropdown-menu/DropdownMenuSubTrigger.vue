<script setup lang="ts">
import type { DropdownMenuSubTriggerProps } from 'reka-ui'

import type { HTMLAttributes } from 'vue'
import { reactiveOmit } from '@vueuse/core'
import { cn } from '@/lib/utils'
import { DropdownMenuSubTrigger, useForwardProps } from 'reka-ui'

const props = defineProps<DropdownMenuSubTriggerProps & { class?: HTMLAttributes['class']; inset?: boolean }>()

const delegatedProps = reactiveOmit(props, 'class', 'inset')
const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
	<DropdownMenuSubTrigger
		data-slot="dropdown-menu-sub-trigger"
		:data-inset="inset ? '' : undefined"
		v-bind="forwardedProps"
		:class="
			cn(
				'flex cursor-default items-center gap-2 rounded-xl px-3 py-2 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-inset:pl-9.5 data-open:bg-accent data-open:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=size-])]:size-4',
				props.class,
			)
		"
	>
		<slot />
		<Icon name="lucide:chevron-right" class="ml-auto" />
	</DropdownMenuSubTrigger>
</template>
