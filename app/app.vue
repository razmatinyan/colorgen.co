<template>
	<TooltipProvider :delay-duration="200">
		<NuxtLayout>
			<NuxtPage />
		</NuxtLayout>
		<Toaster position="bottom-right" rich-colors close-button />
	</TooltipProvider>
</template>
