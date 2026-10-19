<template>
	<section
		class="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 pt-14 pb-20 sm:px-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-14 lg:pt-24 lg:pb-20"
	>
		<div class="grid gap-7">
			<LandingReveal>
				<NuxtLink
					to="/builder"
					class="inline-flex w-fit items-center gap-2 rounded-full bg-muted py-1 pr-3 pl-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
				>
					<Badge class="rounded-full">New</Badge>
					Light and dark tokens with readability checks
					<Icon name="lucide:arrow-right" class="size-3.5" />
				</NuxtLink>
			</LandingReveal>
			<LandingReveal :delay="80">
				<h1 class="text-4xl font-semibold tracking-(--tracking-display) text-balance sm:text-5xl lg:text-6xl">
					Turn one brand color into a complete design system
				</h1>
			</LandingReveal>
			<LandingReveal :delay="160">
				<p class="max-w-xl text-lg text-pretty text-muted-foreground">
					Brand, neutral and status scales, light and dark tokens that pass WCAG, and exports for Tailwind, shadcn, CSS
					and Figma. Free, no sign-up.
				</p>
			</LandingReveal>
			<LandingReveal :delay="240" class="max-w-xl">
				<LandingColorField />
			</LandingReveal>
		</div>
		<LandingReveal :delay="200">
			<LandingSystemStack />
		</LandingReveal>
	</section>
</template>
