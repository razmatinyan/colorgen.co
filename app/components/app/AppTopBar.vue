<script setup lang="ts">
withDefaults(defineProps<{ title: string; titleAs?: 'h1' | 'p' }>(), { titleAs: 'h1' })

const modifierKey = useModifierKey()
</script>

<template>
	<header class="flex h-14 shrink-0 items-center gap-2 border-b px-3 sm:px-4">
		<Tooltip>
			<TooltipTrigger as-child>
				<SidebarTrigger class="-ml-1" />
			</TooltipTrigger>
			<TooltipContent
				>Toggle sidebar
				<KbdGroup
					><Kbd>{{ modifierKey }}</Kbd
					><Kbd>B</Kbd></KbdGroup
				></TooltipContent
			>
		</Tooltip>
		<Separator orientation="vertical" class="mr-1 data-[orientation=vertical]:h-4" />
		<component :is="titleAs" class="min-w-0 truncate text-sm font-medium">{{ title }}</component>
		<div class="ml-auto flex shrink-0 items-center gap-1.5">
			<slot />
		</div>
	</header>
</template>
