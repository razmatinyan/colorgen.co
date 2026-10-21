<script setup lang="ts">
import { describeVisionWarning, tokenGroups, type ColorBlindVision, type VisionWarning } from '~/lib/color'
import { designSystemBuilderKey } from '~/composables/useDesignSystemBuilder'

const emit = defineEmits<{ simulate: [type: ColorBlindVision] }>()
const builder = inject(designSystemBuilderKey)!

const total = computed(() => builder.readability.value.length)
const failing = computed(() => builder.failingReadability.value)
const visionWarnings = computed(() => builder.visionWarnings.value)
const modeLabel = { light: 'Light', dark: 'Dark' } as const

const warningModes = (warning: VisionWarning) =>
	warning.modes.length === 2 ? 'Light and dark' : modeLabel[warning.modes[0]!]
</script>

<template>
	<div class="@container grid gap-6">
		<section class="grid gap-3 rounded-2xl bg-muted/50 p-4" aria-live="polite">
			<div class="flex flex-wrap items-start gap-3">
				<Icon
					:name="failing.length ? 'lucide:triangle-alert' : 'lucide:circle-check'"
					class="mt-0.5 size-5 shrink-0"
					:class="failing.length ? 'text-destructive' : 'text-success'"
				/>
				<div class="min-w-0 flex-1">
					<p class="text-sm font-medium">
						{{
							failing.length
								? `${failing.length} of ${total} readability checks fail`
								: `All ${total} readability checks pass`
						}}
					</p>
					<p class="text-sm text-muted-foreground">
						WCAG 2.2 AA in light and dark mode: 4.5:1 for text, 3:1 for buttons and focus rings. APCA is shown for
						reference.
					</p>
				</div>
				<Button v-if="failing.length" size="sm" @click="builder.fixAll()">
					<Icon name="lucide:wand-sparkles" data-icon="inline-start" /> Fix all
				</Button>
			</div>

			<ul
				v-if="failing.length"
				class="grid grid-cols-1 gap-1 rounded-xl bg-background p-1 ring-1 ring-foreground/10 dark:bg-card"
			>
				<li
					v-for="result in failing"
					:key="`${result.pair.id}:${result.mode}`"
					class="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg px-2.5 py-2 text-sm"
				>
					<span
						class="grid h-7 shrink-0 place-items-center rounded-md px-2 text-xs font-medium ring-1 ring-foreground/10 ring-inset"
						:style="{ background: result.background, color: result.foreground }"
						aria-hidden="true"
						>Aa</span
					>
					<span class="min-w-0 flex-1">
						{{ result.pair.label }}
						<span class="text-muted-foreground">· {{ modeLabel[result.mode] }}</span>
					</span>
					<span class="text-muted-foreground tabular-nums">
						{{ result.ratio.toFixed(2) }} of {{ result.pair.minRatio }} · APCA Lc
						{{ Math.round(Math.abs(result.apca)) }}
					</span>
					<Button variant="outline" size="sm" @click="builder.fixPair(result.pair.id, result.mode)">Fix</Button>
				</li>
			</ul>
		</section>

		<section class="grid gap-3 rounded-2xl bg-muted/50 p-4" aria-labelledby="vision-heading">
			<div class="flex items-start gap-3">
				<Icon
					:name="visionWarnings.length ? 'lucide:eye' : 'lucide:circle-check'"
					class="mt-0.5 size-5 shrink-0"
					:class="visionWarnings.length ? 'text-foreground' : 'text-success'"
				/>
				<div class="min-w-0 flex-1">
					<h3 id="vision-heading" class="text-sm font-medium">
						{{
							visionWarnings.length
								? `${visionWarnings.length} ${visionWarnings.length === 1 ? 'color pair looks' : 'color pairs look'} alike with color blindness`
								: 'Status and chart colors stay distinct with color blindness'
						}}
					</h3>
					<p class="text-sm text-muted-foreground">
						Checked for red-, green- and blue-blind vision.
						{{
							visionWarnings.length
								? 'Pair each status color with an icon or a label so it never relies on color alone.'
								: ''
						}}
					</p>
				</div>
			</div>

			<ul
				v-if="visionWarnings.length"
				class="grid grid-cols-1 gap-1 rounded-xl bg-background p-1 ring-1 ring-foreground/10 dark:bg-card"
			>
				<li
					v-for="warning in visionWarnings"
					:key="warning.id"
					class="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg px-2.5 py-2 text-sm"
				>
					<span class="flex shrink-0 items-center gap-1.5" aria-hidden="true">
						<span class="flex overflow-hidden rounded-md ring-1 ring-foreground/10">
							<span
								v-for="(color, index) in warning.worst.colors"
								:key="index"
								class="size-7"
								:style="{ background: color }"
							/>
						</span>
						<Icon name="lucide:arrow-right" class="size-3.5 text-muted-foreground" />
						<span class="flex overflow-hidden rounded-md ring-1 ring-foreground/10">
							<span
								v-for="(color, index) in warning.worst.simulated"
								:key="index"
								class="size-7"
								:style="{ background: color }"
							/>
						</span>
					</span>
					<span class="min-w-0 flex-1">
						{{ describeVisionWarning(warning) }}
						<span class="text-muted-foreground">· {{ warningModes(warning) }}</span>
					</span>
					<Button variant="outline" size="sm" @click="emit('simulate', warning.worst.type)">
						<Icon name="lucide:scan-eye" data-icon="inline-start" /> Preview
					</Button>
				</li>
			</ul>
		</section>

		<section v-for="group in tokenGroups" :key="group.id" class="grid gap-2" :aria-labelledby="`tokens-${group.id}`">
			<div class="grid grid-cols-2 items-end gap-2 @xl:grid-cols-[minmax(11rem,1fr)_minmax(0,1fr)_minmax(0,1fr)]">
				<h3 :id="`tokens-${group.id}`" class="col-span-2 text-sm font-medium @xl:col-span-1">{{ group.label }}</h3>
				<span class="text-xs text-muted-foreground">Light</span>
				<span class="text-xs text-muted-foreground">Dark</span>
			</div>
			<div
				v-for="name in group.tokens"
				:key="name"
				class="grid grid-cols-2 items-center gap-x-2 gap-y-1.5 @xl:grid-cols-[minmax(11rem,1fr)_minmax(0,1fr)_minmax(0,1fr)]"
			>
				<span class="col-span-2 truncate text-sm text-muted-foreground @xl:col-span-1">{{ name }}</span>
				<BuilderTokenCell :name="name" mode="light" />
				<BuilderTokenCell :name="name" mode="dark" />
			</div>
		</section>
	</div>
</template>
