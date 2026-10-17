<script setup lang="ts">
import type { RecentKind, SavedItem } from '~/lib/library'
import { tools } from '~/lib/tools'

definePageMeta({ layout: 'app' })

useSeoMeta({
	title: 'Library | Sygen',
	description: 'Color systems, palettes, scales and gradients you saved. Stored in this browser only.',
	robots: 'noindex, nofollow',
})

const { saved, save, removeSaved } = useLibrary()
const { showToast } = useAppToast()

const kindLabels: Record<RecentKind, string> = {
	builder: 'Color systems',
	palette: 'Palettes',
	scale: 'Scales',
	contrast: 'Contrast pairs',
	convert: 'Colors',
	gradient: 'Gradients',
}
const kindIcons = Object.fromEntries(tools.map(tool => [tool.id, tool.icon])) as Record<string, string>

type Filter = RecentKind | 'all'
const filter = ref<Filter>('all')
const query = ref('')

const filters = computed(() => {
	const kinds = (Object.keys(kindLabels) as RecentKind[]).filter(kind => saved.value.some(item => item.kind === kind))
	return [{ value: 'all' as Filter, label: 'All' }, ...kinds.map(kind => ({ value: kind as Filter, label: kindLabels[kind] }))]
})

watch(filters, (options) => {
	if (!options.some(option => option.value === filter.value)) filter.value = 'all'
})

const visible = computed(() => {
	const search = query.value.trim().toLowerCase()
	return saved.value.filter(item => (filter.value === 'all' || item.kind === filter.value)
		&& (!search || item.title.toLowerCase().includes(search) || item.colors.some(color => color.includes(search.replace('#', '')))))
})

const dateFormat = new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short', year: 'numeric' })

function swatchBackground(item: SavedItem) {
	return item.kind === 'gradient' ? `linear-gradient(90deg in oklch, ${item.colors.join(', ')})` : undefined
}

function remove(item: SavedItem) {
	removeSaved(item.id)
	showToast('Removed from library', 'info', {
		description: item.title,
		action: { label: 'Undo', onClick: () => save(item) },
	})
}
</script>

<template>
	<div class="flex min-h-0 flex-1 flex-col">
		<AppTopBar title="Library" />

		<div class="min-h-0 flex-1 p-4 lg:overflow-y-auto">
			<ClientOnly>
				<div v-if="saved.length" class="grid gap-5">
					<div class="flex flex-wrap items-center justify-between gap-3">
						<AppSegmentedControl v-model="filter" :options="filters" label="Show" class="max-w-full overflow-x-auto" />
						<Input v-model="query" type="search" placeholder="Search by name or hex" aria-label="Search the library" class="w-full sm:w-64" />
					</div>

					<ul v-if="visible.length" class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
						<li v-for="item in visible" :key="item.id" class="group relative grid gap-3 rounded-2xl bg-card p-2 ring-1 ring-foreground/10 transition-colors hover:bg-muted/40">
							<NuxtLink :to="item.path" class="grid gap-3 rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
								<span v-if="item.kind === 'gradient'" class="h-20 rounded-xl ring-1 ring-foreground/10 ring-inset" :style="{ background: swatchBackground(item) }" aria-hidden="true" />
								<span v-else class="flex h-20 gap-1" aria-hidden="true">
									<span v-for="(color, index) in item.colors" :key="index" class="flex-1 rounded-lg ring-1 ring-foreground/10 ring-inset" :style="{ background: color }" />
								</span>
								<span class="grid gap-0.5 px-2 pr-10 pb-1">
									<span class="truncate text-sm font-medium">{{ item.title }}</span>
									<span class="flex items-center gap-1.5 truncate text-xs text-muted-foreground">
										<Icon :name="kindIcons[item.kind] ?? 'lucide:bookmark'" class="size-3.5 shrink-0" />
										{{ kindLabels[item.kind] }} · {{ dateFormat.format(item.savedAt) }}
									</span>
								</span>
							</NuxtLink>
							<Button variant="ghost" size="icon-sm" class="absolute right-3 bottom-3" :aria-label="`Remove ${item.title}`" @click="remove(item)">
								<Icon name="lucide:trash-2" />
							</Button>
						</li>
					</ul>
					<p v-else class="rounded-xl bg-muted/40 p-8 text-center text-sm text-muted-foreground">Nothing matches “{{ query }}”.</p>

					<p class="flex gap-2 text-sm text-muted-foreground">
						<Icon name="lucide:info" class="mt-0.5 size-4 shrink-0" />
						Your library lives in this browser. Clearing site data removes it.
					</p>
				</div>

				<div v-else class="grid min-h-80 place-items-center content-center gap-4 rounded-2xl bg-muted/40 p-8 text-center">
					<span class="grid size-11 place-items-center rounded-full bg-muted"><Icon name="lucide:bookmark" class="size-5" /></span>
					<div class="grid max-w-sm gap-1">
						<p class="text-sm font-medium">Nothing saved yet</p>
						<p class="text-sm text-pretty text-muted-foreground">Press the bookmark in any tool, or <Kbd>S</Kbd>, to keep a color system, palette, scale or gradient here.</p>
					</div>
					<Button as-child size="sm">
						<NuxtLink to="/builder"><Icon name="lucide:blocks" data-icon="inline-start" /> Open the builder</NuxtLink>
					</Button>
				</div>
			</ClientOnly>
		</div>
	</div>
</template>
