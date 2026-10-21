<script setup lang="ts">
import { useClipboard } from '@vueuse/core'
import { useSidebar } from '~/components/ui/sidebar'
import { maxTitleLength, recentTitle, type RecentItem } from '~/lib/library'

const props = defineProps<{ item: RecentItem; index: number; isActive: boolean }>()

const { saved, save, removeSaved, removeRecent, restoreRecent, renameRecent } = useLibrary()
const { showToast } = useAppToast()
const { copy } = useClipboard({ legacy: true })
const { isMobile } = useSidebar()
const requestUrl = useRequestURL()
const inputId = useId()

const title = computed(() => recentTitle(props.item))
const savedItem = computed(() => saved.value.find((entry) => entry.path === props.item.path) ?? null)

const renameOpen = ref(false)
const draft = ref('')

function openRename() {
	draft.value = title.value
	renameOpen.value = true
}

function submitRename() {
	renameRecent(props.item.id, draft.value)
	renameOpen.value = false
}

async function copyLink() {
	await copy(`${requestUrl.origin}${props.item.path}`)
	showToast('Link copied', 'success', { description: title.value })
}

function toggleSaved() {
	const current = savedItem.value
	if (current) {
		removeSaved(current.id)
		showToast('Removed from saved systems', 'info', {
			description: current.title,
			action: { label: 'Undo', onClick: () => save(current) },
		})
		return
	}
	save({
		id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
		kind: props.item.kind,
		path: props.item.path,
		title: title.value,
		colors: props.item.colors,
		savedAt: Date.now(),
	})
	showToast('Saved', 'success', {
		description: title.value,
		action: { label: 'View', onClick: () => navigateTo('/saved') },
	})
}

function remove() {
	const entry = props.item
	const index = props.index
	removeRecent(entry.id)
	showToast('Removed from recent', 'info', {
		description: recentTitle(entry),
		action: { label: 'Undo', onClick: () => restoreRecent(entry, index) },
	})
}
</script>

<template>
	<SidebarMenuItem>
		<SidebarMenuButton as-child :is-active="isActive" class="group-has-data-[sidebar=menu-action]/menu-item:pr-10">
			<NuxtLink :to="item.path">
				<span
					class="flex h-4 w-7 shrink-0 overflow-hidden rounded-[5px] outline -outline-offset-1 outline-foreground/10"
					aria-hidden="true"
				>
					<span
						v-for="(color, colorIndex) in item.colors"
						:key="colorIndex"
						class="flex-1"
						:style="{ background: color }"
					/>
				</span>
				<span>{{ title }}</span>
			</NuxtLink>
		</SidebarMenuButton>

		<DropdownMenu :modal="false">
			<DropdownMenuTrigger as-child>
				<SidebarMenuAction
					show-on-hover
					class="top-0 right-0 size-9 rounded-sm peer-data-[size=default]/menu-button:top-0 hover:bg-foreground/10 active:bg-foreground/15 aria-expanded:bg-foreground/15"
					:aria-label="`Actions for ${title}`"
				>
					<Icon name="lucide:ellipsis" />
				</SidebarMenuAction>
			</DropdownMenuTrigger>
			<DropdownMenuContent :side="isMobile ? 'bottom' : 'right'" :align="isMobile ? 'end' : 'start'" class="w-52">
				<DropdownMenuItem as-child>
					<a :href="item.path" target="_blank" rel="noopener"> <Icon name="lucide:external-link" /> Open in new tab </a>
				</DropdownMenuItem>
				<DropdownMenuItem @select="copyLink"> <Icon name="lucide:link" /> Copy link </DropdownMenuItem>
				<DropdownMenuItem @select="toggleSaved">
					<Icon :name="savedItem ? 'lucide:bookmark-check' : 'lucide:bookmark'" />
					{{ savedItem ? 'Remove from saved systems' : 'Save' }}
				</DropdownMenuItem>
				<DropdownMenuItem @select="openRename"> <Icon name="lucide:pencil" /> Rename </DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem variant="destructive" @select="remove">
					<Icon name="lucide:trash-2" /> Remove from recent
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>

		<Dialog v-model:open="renameOpen">
			<DialogContent class="gap-5 p-5 sm:max-w-md sm:p-6">
				<DialogHeader>
					<DialogTitle>Rename</DialogTitle>
					<DialogDescription>Leave it empty to go back to “{{ item.title }}”.</DialogDescription>
				</DialogHeader>
				<form class="grid gap-5" @submit.prevent="submitRename">
					<div class="grid gap-2">
						<label :for="inputId" class="text-sm font-medium">Name</label>
						<Input :id="inputId" v-model="draft" :maxlength="maxTitleLength" autocomplete="off" />
					</div>
					<DialogFooter class="gap-2">
						<Button type="button" variant="outline" @click="renameOpen = false">Cancel</Button>
						<Button type="submit">Save</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	</SidebarMenuItem>
</template>
