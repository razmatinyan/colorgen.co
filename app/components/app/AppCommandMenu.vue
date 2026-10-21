<script setup lang="ts">
import { onKeyStroke } from '@vueuse/core'
import { tools } from '~/lib/tools'

const { open, toggle } = useCommandMenu()
const colorMode = useColorMode()

onKeyStroke('k', (event) => {
	if (!(event.metaKey || event.ctrlKey)) return
	event.preventDefault()
	toggle()
})

function run(action: () => unknown) {
	open.value = false
	action()
}

const themes = [
	{ value: 'light', label: 'Light theme', icon: 'lucide:sun' },
	{ value: 'dark', label: 'Dark theme', icon: 'lucide:moon' },
	{ value: 'system', label: 'System theme', icon: 'lucide:monitor' },
] as const
</script>

<template>
	<CommandDialog
		v-model:open="open"
		title="Command menu"
		description="Jump to a tool or change settings."
		class="sm:max-w-xl"
	>
		<CommandInput placeholder="Search tools and actions…" />
		<CommandList>
			<CommandEmpty>Nothing found.</CommandEmpty>

			<CommandGroup heading="Tools">
				<CommandItem
					v-for="tool in tools"
					:key="tool.id"
					:value="tool.label"
					:disabled="tool.status === 'planned'"
					:class="tool.status === 'planned' && 'opacity-60'"
					@select="run(() => navigateTo(tool.to))"
				>
					<Icon :name="tool.icon" />
					<span>{{ tool.label }}</span>
					<span class="truncate text-muted-foreground">{{ tool.description }}</span>
					<Badge v-if="tool.status === 'planned'" variant="secondary" class="ml-auto">Soon</Badge>
				</CommandItem>
			</CommandGroup>

			<CommandSeparator />

			<CommandGroup heading="Actions">
				<CommandItem value="Import colors" @select="run(() => navigateTo('/builder?import'))">
					<Icon name="lucide:file-input" />
					<span>Import colors</span>
					<span class="truncate text-muted-foreground">From CSS, Tailwind or design tokens</span>
				</CommandItem>
			</CommandGroup>

			<CommandSeparator />

			<CommandGroup heading="Theme">
				<CommandItem
					v-for="theme in themes"
					:key="theme.value"
					:value="theme.label"
					@select="
						run(() => {
							colorMode.preference = theme.value
						})
					"
				>
					<Icon :name="theme.icon" />
					{{ theme.label }}
					<Icon v-if="colorMode.preference === theme.value" name="lucide:check" class="ml-auto" />
				</CommandItem>
			</CommandGroup>

			<CommandSeparator />

			<CommandGroup heading="Links">
				<CommandItem value="Saved systems" @select="run(() => navigateTo('/saved'))">
					<Icon name="lucide:bookmark" /> Saved systems
				</CommandItem>
				<CommandItem
					value="Source on GitHub"
					@select="
						run(() =>
							navigateTo('https://github.com/razmatinyan/sygen.app', { external: true, open: { target: '_blank' } }),
						)
					"
				>
					<Icon name="lucide:github" /> Source on GitHub
				</CommandItem>
			</CommandGroup>
		</CommandList>
	</CommandDialog>
</template>
