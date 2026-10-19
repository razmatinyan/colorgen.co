<script setup lang="ts">
import type { SelectScrollDownButtonProps } from 'reka-ui'

import type { HTMLAttributes } from 'vue'
import { reactiveOmit } from '@vueuse/core'
import { cn } from '@/lib/utils'
import { SelectScrollDownButton, useForwardProps } from 'reka-ui'

const props = defineProps<SelectScrollDownButtonProps & { class?: HTMLAttributes['class'] }>()

const delegatedProps = reactiveOmit(props, 'class')

const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
	<SelectScrollDownButton
		data-slot="select-scroll-down-button"
		v-bind="forwardedProps"
		:class="
			cn(
				'z-10 flex cursor-default items-center justify-center bg-popover py-1 [&_svg:not([class*=size-])]:size-4',
				props.class,
			)
		"
	>
		<slot>
			<Icon name="lucide:chevron-down" />
		</slot>
	</SelectScrollDownButton>
</template>
