<script setup lang="ts">
withDefaults(defineProps<{
  text: string
  side?: 'top' | 'right' | 'bottom' | 'left'
}>(), {
  side: 'top',
})
</script>

<template>
  <Tooltip>
    <TooltipTrigger as-child>
      <slot />
    </TooltipTrigger>
    <TooltipContent :side="side">
      {{ text }}
    </TooltipContent>
  </Tooltip>
</template>
