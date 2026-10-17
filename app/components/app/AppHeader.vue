<script setup lang="ts">
import { tools } from '~/lib/tools'

const route = useRoute()
const mobileOpen = ref(false)

watch(() => route.fullPath, () => {
	mobileOpen.value = false
})

function isActive(to: string) {
	return route.path === to || route.path.startsWith(`${to}/`)
}

const navItem = 'inline-flex h-8 items-center rounded-4xl px-3 text-sm font-medium transition-colors'
</script>

<template>
	<header class="sticky top-0 z-40 h-14 border-b bg-background/80 backdrop-blur-md">
		<div class="flex h-full items-center gap-6 px-4 sm:px-6">
			<NuxtLink to="/" class="rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50" aria-label="Sygen home">
				<AppLogo />
			</NuxtLink>

			<nav aria-label="Tools" class="hidden items-center gap-1 md:flex">
				<template v-for="tool in tools" :key="tool.id">
					<NuxtLink
						v-if="tool.status === 'live'"
						:to="tool.to"
						:class="[navItem, isActive(tool.to) ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground']"
					>
						{{ tool.label }}
					</NuxtLink>
					<Tooltip v-else>
						<TooltipTrigger as-child>
							<span :class="[navItem, 'cursor-default text-muted-foreground/50']">{{ tool.label }}</span>
						</TooltipTrigger>
						<TooltipContent>Coming soon</TooltipContent>
					</Tooltip>
				</template>
			</nav>

			<div class="ml-auto flex items-center gap-1">
				<AppCommandTrigger />
				<NuxtLink
					to="/saved"
					:class="[navItem, 'hidden sm:inline-flex', isActive('/saved') ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground']"
				>
					Library
				</NuxtLink>
				<AppThemeToggle />
				<Button as="a" href="https://github.com/razmatinyan/colorgen.co" target="_blank" rel="noopener" variant="ghost" size="icon" aria-label="Source on GitHub" class="hidden sm:inline-flex">
					<Icon name="lucide:github" />
				</Button>

				<Popover v-model:open="mobileOpen">
					<PopoverTrigger as-child>
						<Button variant="ghost" size="icon" class="md:hidden" aria-label="Open menu">
							<Icon :name="mobileOpen ? 'lucide:x' : 'lucide:menu'" />
						</Button>
					</PopoverTrigger>
					<PopoverContent align="end" class="w-64 p-1.5">
						<nav aria-label="Tools" class="flex flex-col gap-0.5">
							<template v-for="tool in tools" :key="tool.id">
								<NuxtLink
									v-if="tool.status === 'live'"
									:to="tool.to"
									class="flex items-center gap-3 rounded-xl px-3 py-2 text-sm hover:bg-muted"
								>
									<Icon :name="tool.icon" class="size-4 text-muted-foreground" />
									{{ tool.label }}
								</NuxtLink>
								<span v-else class="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted-foreground">
									<Icon :name="tool.icon" class="size-4" />
									{{ tool.label }}
									<Badge variant="secondary" class="ml-auto">Soon</Badge>
								</span>
							</template>
							<Separator class="my-1" />
							<NuxtLink to="/saved" class="flex items-center gap-3 rounded-xl px-3 py-2 text-sm hover:bg-muted">
								<Icon name="lucide:bookmark" class="size-4 text-muted-foreground" />
								Library
							</NuxtLink>
						</nav>
					</PopoverContent>
				</Popover>
			</div>
		</div>
	</header>
</template>
