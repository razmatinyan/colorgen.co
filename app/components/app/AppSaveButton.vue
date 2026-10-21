<script setup lang="ts">
import { onKeyStroke } from '@vueuse/core'
import { isInteractiveTarget } from '~/lib/keyboard'
import type { RecentKind } from '~/lib/library'
import type { RecentSnapshot } from '~/composables/useLibrary'

const props = defineProps<{ kind: RecentKind; path: string; snapshot: () => RecentSnapshot }>()

const { saved, save, removeSaved } = useLibrary()
const { showToast } = useAppToast()

const savedItem = computed(() => saved.value.find((item) => item.path === props.path) ?? null)

function toggle() {
	const current = savedItem.value
	if (current) {
		removeSaved(current.id)
		showToast('Removed from saved systems', 'info', {
			description: current.title,
			action: { label: 'Undo', onClick: () => save(current) },
		})
		return
	}
	const entry = {
		id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
		kind: props.kind,
		path: props.path,
		savedAt: Date.now(),
		...props.snapshot(),
	}
	save(entry)
	showToast('Saved', 'success', {
		description: entry.title,
		action: { label: 'View', onClick: () => navigateTo('/saved') },
	})
}

onKeyStroke(['s', 'S'], (event) => {
	if (isInteractiveTarget(event) || event.metaKey || event.ctrlKey || event.altKey) return
	event.preventDefault()
	toggle()
})
</script>

<template>
	<Tooltip>
		<TooltipTrigger as-child>
			<Button
				variant="ghost"
				size="icon-sm"
				:aria-label="savedItem ? 'Remove from saved systems' : 'Save'"
				:aria-pressed="!!savedItem"
				@click="toggle"
			>
				<Icon :name="savedItem ? 'lucide:bookmark-check' : 'lucide:bookmark'" />
			</Button>
		</TooltipTrigger>
		<TooltipContent>{{ savedItem ? 'Saved · click to remove' : 'Save' }} <Kbd>S</Kbd></TooltipContent>
	</Tooltip>
</template>
