<script setup lang="ts">
const sidebarState = useCookie<boolean | undefined>('sidebar_state')
</script>

<template>
	<SidebarProvider :default-open="sidebarState !== false" class="lg:h-svh lg:overflow-hidden">
		<AppSidebar />
		<SidebarInset class="min-w-0 md:peer-data-[variant=inset]:shadow-none md:peer-data-[variant=inset]:ring-1 md:peer-data-[variant=inset]:ring-foreground/10 lg:overflow-hidden">
			<slot />
		</SidebarInset>
	</SidebarProvider>
</template>
