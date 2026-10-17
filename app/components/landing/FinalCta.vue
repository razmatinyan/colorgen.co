<template>
	<section class="border-t">
		<div class="mx-auto grid max-w-2xl justify-items-center gap-8 px-4 py-24 text-center sm:px-6 lg:py-32">
			<LandingReveal class="grid gap-3">
				<h2 class="text-3xl font-semibold tracking-(--tracking-display) text-balance sm:text-5xl">Start with your brand color.</h2>
				<p class="text-lg text-pretty text-muted-foreground">You'll have scales, tokens and exports in under a minute.</p>
			</LandingReveal>
			<LandingReveal :delay="100" class="w-full text-left">
				<LandingColorField :show-samples="false" />
			</LandingReveal>
		</div>
	</section>
</template>
