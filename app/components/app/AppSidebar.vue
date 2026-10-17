<script setup lang="ts">
import { useSidebar } from '~/components/ui/sidebar'
import { tools } from '~/lib/tools'

const route = useRoute()
const colorMode = useColorMode()
const modifierKey = useModifierKey()
const { show: showCommandMenu } = useCommandMenu()
const { recents, clearRecents } = useLibrary()
const { isMobile, setOpenMobile } = useSidebar()

const [builder, ...otherTools] = tools

const themes = [
	{ value: 'system', label: 'System theme', icon: 'lucide:monitor' },
	{ value: 'light', label: 'Light theme', icon: 'lucide:sun' },
	{ value: 'dark', label: 'Dark theme', icon: 'lucide:moon' },
] as const
const currentTheme = computed(() => themes.find(theme => theme.value === colorMode.preference) ?? themes[0])

function cycleTheme() {
	const index = themes.findIndex(theme => theme.value === colorMode.preference)
	colorMode.preference = themes[(index + 1) % themes.length]!.value
}

function isActive(to: string) {
	return route.path === to || route.path.startsWith(`${to}/`)
}

watch(() => route.fullPath, () => {
	if (isMobile.value) setOpenMobile(false)
})
</script>

<template>
	<Sidebar variant="inset" collapsible="icon">
		<SidebarHeader>
			<SidebarMenu>
				<SidebarMenuItem>
					<SidebarMenuButton as-child tooltip="ColorGen home">
						<NuxtLink to="/" aria-label="ColorGen home">
							<AppLogo />
						</NuxtLink>
					</SidebarMenuButton>
				</SidebarMenuItem>
				<SidebarMenuItem>
					<SidebarMenuButton tooltip="Search" class="text-muted-foreground" @click="showCommandMenu">
						<Icon name="lucide:search" />
						<span>Search</span>
						<KbdGroup class="ml-auto group-data-[collapsible=icon]:hidden">
							<Kbd>{{ modifierKey }}</Kbd>
							<Kbd>K</Kbd>
						</KbdGroup>
					</SidebarMenuButton>
				</SidebarMenuItem>
				<SidebarMenuItem v-if="builder">
					<SidebarMenuButton as-child :is-active="isActive(builder.to)" :tooltip="builder.label">
						<NuxtLink :to="builder.to">
							<Icon :name="builder.icon" />
							<span>{{ builder.label }}</span>
						</NuxtLink>
					</SidebarMenuButton>
				</SidebarMenuItem>
			</SidebarMenu>
		</SidebarHeader>

		<SidebarContent>
			<SidebarGroup>
				<SidebarGroupLabel>Tools</SidebarGroupLabel>
				<SidebarMenu>
					<SidebarMenuItem v-for="tool in otherTools" :key="tool.id">
						<SidebarMenuButton
							v-if="tool.status === 'live'"
							as-child
							:is-active="isActive(tool.to)"
							:tooltip="tool.label"
						>
							<NuxtLink :to="tool.to">
								<Icon :name="tool.icon" />
								<span>{{ tool.label }}</span>
							</NuxtLink>
						</SidebarMenuButton>
						<template v-else>
							<SidebarMenuButton aria-disabled="true" :tooltip="`${tool.label} · coming soon`">
								<Icon :name="tool.icon" />
								<span>{{ tool.label }}</span>
							</SidebarMenuButton>
							<SidebarMenuBadge>Soon</SidebarMenuBadge>
						</template>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarGroup>

			<SidebarGroup class="group-data-[collapsible=icon]:hidden">
				<SidebarGroupLabel>Recent</SidebarGroupLabel>
				<Tooltip v-if="recents.length">
					<TooltipTrigger as-child>
						<SidebarGroupAction aria-label="Clear recent" @click="clearRecents">
							<Icon name="lucide:x" />
						</SidebarGroupAction>
					</TooltipTrigger>
					<TooltipContent side="right">Clear recent</TooltipContent>
				</Tooltip>
				<ClientOnly>
					<SidebarMenu v-if="recents.length">
						<SidebarMenuItem v-for="item in recents" :key="item.id">
							<SidebarMenuButton as-child :is-active="route.fullPath === item.path">
								<NuxtLink :to="item.path">
									<span class="flex h-4 w-7 shrink-0 overflow-hidden rounded-[5px] outline outline-foreground/10 -outline-offset-1" aria-hidden="true">
										<span v-for="(color, index) in item.colors" :key="index" class="flex-1" :style="{ background: color }" />
									</span>
									<span>{{ item.title }}</span>
								</NuxtLink>
							</SidebarMenuButton>
						</SidebarMenuItem>
					</SidebarMenu>
					<div v-else class="mx-2 grid justify-items-center gap-2 rounded-md border border-dashed px-3 py-4 text-center">
						<p class="text-sm text-muted-foreground">Color systems and palettes you open show up here.</p>
						<Button as-child size="sm" variant="secondary">
							<NuxtLink to="/builder">Open the builder</NuxtLink>
						</Button>
					</div>
				</ClientOnly>
			</SidebarGroup>
		</SidebarContent>

		<SidebarFooter>
			<SidebarMenu>
				<SidebarMenuItem>
					<SidebarMenuButton as-child :is-active="isActive('/saved')" tooltip="Library">
						<NuxtLink to="/saved">
							<Icon name="lucide:bookmark" />
							<span>Library</span>
						</NuxtLink>
					</SidebarMenuButton>
				</SidebarMenuItem>
				<SidebarMenuItem>
					<SidebarMenuButton as-child :is-active="isActive('/contact')" tooltip="Contact">
						<NuxtLink to="/contact">
							<Icon name="lucide:mail" />
							<span>Contact</span>
						</NuxtLink>
					</SidebarMenuButton>
				</SidebarMenuItem>
				<SidebarMenuItem>
					<SidebarMenuButton as-child tooltip="Source on GitHub">
						<a href="https://github.com/razmatinyan/colorgen.co" target="_blank" rel="noopener">
							<Icon name="lucide:github" />
							<span>Source on GitHub</span>
						</a>
					</SidebarMenuButton>
				</SidebarMenuItem>
				<SidebarMenuItem>
					<SidebarMenuButton :tooltip="currentTheme.label" @click="cycleTheme">
						<ClientOnly>
							<Icon :name="currentTheme.icon" />
							<template #fallback>
								<Icon name="lucide:monitor" />
							</template>
						</ClientOnly>
						<span>
							<ClientOnly fallback="System theme">{{ currentTheme.label }}</ClientOnly>
						</span>
					</SidebarMenuButton>
				</SidebarMenuItem>
			</SidebarMenu>
		</SidebarFooter>
		<SidebarRail />
	</Sidebar>
</template>
