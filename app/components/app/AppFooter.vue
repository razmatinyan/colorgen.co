<template>
	<footer class="border-t">
		<div class="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
			<p>
				Built by <a href="https://razmatinyan.com" target="_blank" rel="noopener" class="text-foreground underline-offset-4 hover:underline">Raz Matinyan</a> in Armenia.
			</p>
			<div class="flex items-center gap-4">
				<NuxtLink to="/contact" class="hover:text-foreground">Contact</NuxtLink>
				<a href="https://github.com/razmatinyan" target="_blank" rel="noopener" aria-label="GitHub" class="hover:text-foreground">
					<Icon name="lucide:github" class="size-4" />
				</a>
				<a href="https://www.instagram.com/raz28m/" target="_blank" rel="noopener" aria-label="Instagram" class="hover:text-foreground">
					<Icon name="lucide:instagram" class="size-4" />
				</a>
			</div>
		</div>
	</footer>
</template>
