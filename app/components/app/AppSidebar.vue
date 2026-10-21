<script setup lang="ts">
import { useSidebar } from '~/components/ui/sidebar'
import { tools } from '~/lib/tools'

const route = useRoute()
const modifierKey = useModifierKey()
const { show: showCommandMenu } = useCommandMenu()
const { recents, clearRecents } = useLibrary()
const { isMobile, setOpenMobile } = useSidebar()

const [builder, ...otherTools] = tools

function isActive(to: string) {
	return route.path === to || route.path.startsWith(`${to}/`)
}

watch(
	() => route.fullPath,
	() => {
		if (isMobile.value) setOpenMobile(false)
	},
)
</script>

<template>
	<Sidebar variant="inset" collapsible="icon">
		<SidebarHeader>
			<SidebarMenu>
				<SidebarMenuItem>
					<SidebarMenuButton as-child tooltip="Sygen home">
						<NuxtLink to="/" aria-label="Sygen home">
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
				<SidebarMenuItem>
					<SidebarMenuButton as-child :is-active="isActive('/saved')" tooltip="Saved systems">
						<NuxtLink to="/saved">
							<Icon name="lucide:bookmark" />
							<span>Saved systems</span>
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
						<AppRecentItem
							v-for="(item, index) in recents"
							:key="item.id"
							:item="item"
							:index="index"
							:is-active="route.fullPath === item.path"
						/>
					</SidebarMenu>
					<div
						v-else
						class="mx-2 grid justify-items-center gap-2 rounded-md border border-dashed px-3 py-4 text-center"
					>
						<p class="text-sm text-muted-foreground">Color systems and palettes you open show up here.</p>
						<Button as-child size="sm" variant="secondary">
							<NuxtLink to="/builder">Open the builder</NuxtLink>
						</Button>
					</div>
				</ClientOnly>
			</SidebarGroup>
		</SidebarContent>

		<SidebarFooter>
			<div class="flex items-center gap-1 group-data-[collapsible=icon]:flex-col">
				<AppThemeToggle />
			</div>
		</SidebarFooter>
		<SidebarRail />
	</Sidebar>
</template>
