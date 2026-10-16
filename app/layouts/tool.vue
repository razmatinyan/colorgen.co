<!-- Full-height workspace layout for tools: header only, no footer, no page scroll on desktop. -->
<template>
	<div class="flex min-h-dvh flex-col lg:h-dvh lg:overflow-hidden">
		<AppHeader />
		<main class="flex min-h-0 flex-1 flex-col">
			<slot />
		</main>
	</div>
</template>
