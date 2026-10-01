<script lang="ts" setup>
import type { ToasterProps } from 'vue-sonner'

import { reactiveOmit } from '@vueuse/core'
import { Toaster as Sonner } from 'vue-sonner'
import { cn } from '@/lib/utils'

const props = defineProps<ToasterProps>()
const delegatedProps = reactiveOmit(props, 'class', 'toastOptions')
</script>

<template>
  <Sonner
    :class="cn('toaster group', props.class)"
    :style="{
      '--normal-bg': 'var(--popover)',
      '--normal-text': 'var(--popover-foreground)',
      '--normal-border': 'var(--border)',
      '--border-radius': 'var(--radius)',
      '--gray2': 'hsl(var(--popover) / 0.9)',
      '--gray3': 'var(--border)',
      '--gray4': 'var(--border)',
      '--gray5': 'var(--border)',
      '--gray12': 'var(--popover-foreground)',
    }"
    :toast-options="props.toastOptions ?? {
      classes: {
        toast: 'rounded-2xl',
      },
    }"
    v-bind="delegatedProps"
  >
    <template #success-icon>
      <Icon name="lucide:circle-check" class="size-4" />
    </template>
    <template #info-icon>
      <Icon name="lucide:info" class="size-4" />
    </template>
    <template #warning-icon>
      <Icon name="lucide:triangle-alert" class="size-4" />
    </template>
    <template #error-icon>
      <Icon name="lucide:octagon-x" class="size-4" />
    </template>
    <template #loading-icon>
      <div>
        <Icon name="lucide:loader-circle" class="size-4 animate-spin" />
      </div>
    </template>
    <template #close-icon>
      <Icon name="lucide:x" class="size-4" />
    </template>
  </Sonner>
</template>
