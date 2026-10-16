<script setup lang="ts">
import { palettePrototypeKey, readableOn, scaleOf, toHex } from '~/prototype/palette'

const props = defineProps<{ mode: 'light' | 'dark' }>()
const proto = inject(palettePrototypeKey)!

/** Maps the palette onto a small semantic token set, the way the Theme tool will. */
const tokens = computed(() => {
	const [primary, secondary, accent, highlight, neutral] = proto.colors.value
	const n = scaleOf(neutral!)
	const p = scaleOf(primary!)
	const s = scaleOf(secondary!)
	const a = scaleOf(accent!)
	const hi = scaleOf(highlight!)
	const dark = props.mode === 'dark'

	const primaryColor = dark ? p[4]! : toHex(primary!)
	const secondaryColor = dark ? s[4]! : toHex(secondary!)
	const accentColor = dark ? a[4]! : toHex(accent!)
	return {
		'--pv-bg': dark ? n[10] : n[0],
		'--pv-surface': dark ? n[9] : '#ffffff',
		'--pv-field': dark ? n[8] : n[1],
		'--pv-text': dark ? n[0] : n[10],
		'--pv-muted': dark ? n[4] : n[6],
		'--pv-border': dark ? n[8] : n[2],
		'--pv-primary': primaryColor,
		'--pv-on-primary': readableOn(primaryColor),
		'--pv-secondary': secondaryColor,
		'--pv-on-secondary': readableOn(secondaryColor),
		'--pv-accent': accentColor,
		'--pv-on-accent': readableOn(accentColor),
		'--pv-highlight': dark ? hi[8] : toHex(highlight!),
		'--pv-on-highlight': dark ? hi[1] : hi[9],
		// Bar chart uses tints of primary, light to dark.
		'--pv-bar-1': dark ? p[7] : p[2],
		'--pv-bar-2': dark ? p[5] : p[4],
		'--pv-bar-3': dark ? p[6] : p[3],
		'--pv-bar-4': primaryColor,
		'--pv-bar-5': dark ? p[8] : p[1],
	}
})

const card = 'mb-4 break-inside-avoid rounded-2xl bg-(--pv-surface) p-5 ring-1 ring-(--pv-border)'
const field = 'flex h-9 items-center rounded-full bg-(--pv-field) px-3.5 text-sm text-(--pv-muted)'
const soft = (token: string, amount = 16) => ({ background: `color-mix(in oklch, var(${token}) ${amount}%, transparent)` })

const bars = [
	{ month: 'Dec', height: 58, tone: '--pv-bar-1' },
	{ month: 'Jan', height: 92, tone: '--pv-bar-2' },
	{ month: 'Feb', height: 74, tone: '--pv-bar-3' },
	{ month: 'Mar', height: 100, tone: '--pv-bar-4' },
	{ month: 'Apr', height: 66, tone: '--pv-bar-5' },
]

const visitors = [52, 60, 48, 66, 58, 74, 62, 70, 56, 80, 72, 88]
const area = computed(() => {
	const step = 300 / (visitors.length - 1)
	const points = visitors.map((value, index) => `${(index * step).toFixed(1)},${(100 - value).toFixed(1)}`)
	return { line: `M${points.join(' L')}`, fill: `M0,100 L${points.join(' L')} L300,100 Z` }
})

interface NavItem { label: string, icon: string, active?: boolean, count?: number }

const navGroups: { title: string, items: NavItem[] }[] = [
	{ title: 'Workspace', items: [
		{ label: 'Documents', icon: 'lucide:file-text' },
		{ label: 'Reports', icon: 'lucide:chart-column', active: true },
		{ label: 'Goals', icon: 'lucide:target' },
		{ label: 'Calendar', icon: 'lucide:calendar' },
	] },
	{ title: 'Account', items: [
		{ label: 'Profile', icon: 'lucide:user' },
		{ label: 'Billing', icon: 'lucide:credit-card' },
		{ label: 'Notifications', icon: 'lucide:bell', count: 3 },
	] },
]

const notifications = [
	{ label: 'Product updates', description: 'New features and improvements.', on: true },
	{ label: 'Security alerts', description: 'Sign-ins and account changes.', on: true },
	{ label: 'Weekly digest', description: 'A summary every Monday.', on: false },
]

const team = [
	{ initials: 'AM', tone: 'highlight' },
	{ initials: 'DK', tone: 'accent' },
	{ initials: 'LS', tone: 'secondary' },
	{ initials: 'RM', tone: 'primary' },
]
</script>

<template>
	<div
		class="@container rounded-xl bg-(--pv-bg) p-4 text-(--pv-text) ring-1 ring-(--pv-border) transition-colors duration-200"
		:style="tokens"
	>
		<div class="columns-1 gap-4 @xl:columns-2 @4xl:columns-3">
			<!-- Controls -->
			<div :class="card" class="grid gap-4">
				<div class="flex flex-wrap gap-2">
					<span class="inline-flex h-9 items-center gap-1.5 rounded-full bg-(--pv-primary) px-4 text-sm font-medium text-(--pv-on-primary)">
						Button <Icon name="lucide:arrow-right" class="size-4" />
					</span>
					<span class="inline-flex h-9 items-center rounded-full bg-(--pv-secondary) px-4 text-sm font-medium text-(--pv-on-secondary)">Secondary</span>
					<span class="inline-flex h-9 items-center rounded-full px-4 text-sm font-medium ring-1 ring-(--pv-border) ring-inset">Outline</span>
				</div>
				<div :class="field" class="justify-between">
					Search
					<Icon name="lucide:search" class="size-4" />
				</div>
				<div class="h-20 rounded-2xl bg-(--pv-field) px-3.5 py-2.5 text-sm text-(--pv-muted)">Message</div>
				<div class="flex items-center justify-between gap-3">
					<div class="flex gap-1.5">
						<span class="rounded-full px-2.5 py-0.5 text-xs font-medium text-(--pv-primary)" :style="soft('--pv-primary')">Badge</span>
						<span class="rounded-full bg-(--pv-accent) px-2.5 py-0.5 text-xs font-medium text-(--pv-on-accent)">New</span>
					</div>
					<div class="flex items-center gap-2.5">
						<span class="grid size-4.5 place-items-center rounded-full ring-2 ring-(--pv-primary) ring-inset"><span class="size-2 rounded-full bg-(--pv-primary)" /></span>
						<span class="grid size-4.5 place-items-center rounded-md bg-(--pv-primary) text-(--pv-on-primary)"><Icon name="lucide:check" class="size-3.5" /></span>
						<span class="flex h-5 w-9 items-center justify-end rounded-full bg-(--pv-primary) p-0.5"><span class="size-4 rounded-full bg-(--pv-on-primary)" /></span>
					</div>
				</div>
			</div>

			<!-- Bar chart -->
			<div :class="card" class="grid gap-4">
				<div>
					<p class="font-medium">Contribution history</p>
					<p class="text-sm text-(--pv-muted)">Last 5 months of activity</p>
				</div>
				<div class="flex h-36 items-end gap-3">
					<div v-for="bar in bars" :key="bar.month" class="flex h-full flex-1 flex-col justify-end gap-2">
						<span class="w-full rounded-xl transition-colors duration-300" :style="{ height: `${bar.height}%`, background: `var(${bar.tone})` }" />
						<span class="text-center text-xs text-(--pv-muted)">{{ bar.month }}</span>
					</div>
				</div>
				<div class="grid grid-cols-2 gap-2">
					<div class="rounded-xl bg-(--pv-field) p-3">
						<p class="text-xs text-(--pv-muted)">Upcoming</p>
						<p class="font-semibold">May 2026</p>
						<p class="text-xs text-(--pv-muted)">Scheduled</p>
					</div>
					<div class="rounded-xl bg-(--pv-field) p-3">
						<p class="text-xs text-(--pv-muted)">Savings plan</p>
						<p class="font-semibold">Accelerated</p>
						<p class="text-xs text-(--pv-muted)">Recurring</p>
					</div>
				</div>
				<span class="flex h-9 items-center justify-center rounded-full text-sm font-medium ring-1 ring-(--pv-border) ring-inset">View full report</span>
			</div>

			<!-- Form -->
			<div :class="card" class="grid gap-4">
				<div>
					<p class="font-medium">Create a project</p>
					<p class="text-sm text-(--pv-muted)">Set a budget and a deadline. You can change them later.</p>
				</div>
				<div class="grid gap-1.5">
					<span class="text-sm font-medium">Project name</span>
					<span :class="field">e.g. Spring campaign</span>
				</div>
				<div class="grid grid-cols-2 gap-3">
					<div class="grid gap-1.5">
						<span class="text-sm font-medium">Budget</span>
						<span :class="field" class="text-(--pv-text)">$15,000</span>
					</div>
					<div class="grid gap-1.5">
						<span class="text-sm font-medium">Deadline</span>
						<span :class="field" class="text-(--pv-text)">Dec 2026</span>
					</div>
				</div>
				<div class="grid gap-2">
					<span class="flex h-9 items-center justify-center rounded-full bg-(--pv-primary) text-sm font-medium text-(--pv-on-primary)">Create project</span>
					<span class="flex h-9 items-center justify-center rounded-full text-sm font-medium ring-1 ring-(--pv-border) ring-inset">Cancel</span>
				</div>
			</div>

			<!-- Balance -->
			<div :class="card" class="grid gap-3">
				<p class="text-sm text-(--pv-muted)">Available balance</p>
				<p class="text-3xl font-semibold tracking-tight tabular-nums">$1,211.29</p>
				<span class="inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium" :style="soft('--pv-accent', 20)">
					<span class="size-1.5 rounded-full bg-(--pv-accent)" /> Pending setup
				</span>
				<div class="mt-1 grid gap-2.5 rounded-xl bg-(--pv-field) p-3.5 text-sm">
					<div class="flex justify-between"><span class="text-(--pv-muted)">Net revenue</span><span class="font-medium tabular-nums">$1,248.75</span></div>
					<div class="flex justify-between"><span class="text-(--pv-muted)">Processing fee</span><span class="font-medium tabular-nums">−$37.46</span></div>
					<div class="h-px bg-(--pv-border)" />
					<div class="flex justify-between"><span class="text-(--pv-muted)">Total</span><span class="font-semibold tabular-nums text-(--pv-secondary)">$1,211.29</span></div>
				</div>
			</div>

			<!-- Navigation -->
			<div :class="card" class="grid gap-4 p-3">
				<div v-for="group in navGroups" :key="group.title" class="grid gap-0.5">
					<p class="px-2.5 pb-1 text-xs text-(--pv-muted)">{{ group.title }}</p>
					<span
						v-for="item in group.items"
						:key="item.label"
						class="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm"
						:class="item.active && 'font-medium text-(--pv-primary)'"
						:style="item.active ? soft('--pv-primary', 14) : undefined"
					>
						<Icon :name="item.icon" class="size-4" :class="!item.active && 'text-(--pv-muted)'" />
						{{ item.label }}
						<span v-if="item.count" class="ml-auto rounded-full bg-(--pv-accent) px-1.5 text-xs font-semibold text-(--pv-on-accent)">{{ item.count }}</span>
					</span>
				</div>
			</div>

			<!-- Analytics -->
			<div :class="card" class="grid gap-3 overflow-hidden pb-0">
				<div class="flex items-start justify-between gap-3">
					<div>
						<p class="font-medium">Visitors</p>
						<p class="flex items-center gap-2 text-sm text-(--pv-muted)">
							418.2K this month
							<span class="rounded-full px-2 py-0.5 text-xs font-medium text-(--pv-secondary)" :style="soft('--pv-secondary', 18)">+10%</span>
						</p>
					</div>
					<span class="rounded-full px-3 py-1 text-sm font-medium ring-1 ring-(--pv-border) ring-inset">View</span>
				</div>
				<svg viewBox="0 0 300 100" preserveAspectRatio="none" class="-mx-5 h-24 w-[calc(100%+2.5rem)]" aria-hidden="true">
					<path :d="area.fill" fill="var(--pv-primary)" fill-opacity="0.18" />
					<path :d="area.line" fill="none" stroke="var(--pv-primary)" stroke-width="2" vector-effect="non-scaling-stroke" />
				</svg>
			</div>

			<!-- Chat -->
			<div :class="card" class="grid gap-4">
				<div class="flex items-center justify-between">
					<div>
						<p class="font-medium">New chat</p>
						<p class="text-sm text-(--pv-muted)">Usually replies in minutes</p>
					</div>
					<span class="grid size-8 place-items-center rounded-full ring-1 ring-(--pv-border) ring-inset"><Icon name="lucide:refresh-cw" class="size-4" /></span>
				</div>
				<div class="grid gap-2 text-sm">
					<p class="max-w-[85%] rounded-2xl rounded-bl-md bg-(--pv-field) px-3.5 py-2">Can you send over the brand colors?</p>
					<p class="max-w-[85%] justify-self-end rounded-2xl rounded-br-md bg-(--pv-primary) px-3.5 py-2 text-(--pv-on-primary)">Sure, exporting them now.</p>
				</div>
				<div :class="field" class="justify-between pr-1">
					Write a message…
					<span class="grid size-7 place-items-center rounded-full bg-(--pv-primary) text-(--pv-on-primary)"><Icon name="lucide:send" class="size-3.5" /></span>
				</div>
			</div>

			<!-- Notifications -->
			<div :class="card" class="grid gap-4">
				<div>
					<p class="font-medium">Notifications</p>
					<p class="text-sm text-(--pv-muted)">Choose what you want to hear about.</p>
				</div>
				<div v-for="item in notifications" :key="item.label" class="flex gap-3">
					<span
						class="mt-0.5 grid size-4.5 shrink-0 place-items-center rounded-md"
						:class="item.on ? 'bg-(--pv-primary) text-(--pv-on-primary)' : 'ring-1 ring-(--pv-border) ring-inset'"
					>
						<Icon v-if="item.on" name="lucide:check" class="size-3.5" />
					</span>
					<div>
						<p class="text-sm font-medium">{{ item.label }}</p>
						<p class="text-sm text-(--pv-muted)">{{ item.description }}</p>
					</div>
				</div>
			</div>

			<!-- Empty state -->
			<div :class="card" class="flex flex-col items-center gap-3 py-8 text-center">
				<span class="grid size-11 place-items-center rounded-full" :style="soft('--pv-primary', 14)">
					<Icon name="lucide:plus" class="size-5 text-(--pv-primary)" />
				</span>
				<div>
					<p class="font-medium">Publish your first page</p>
					<p class="mx-auto max-w-56 text-sm text-(--pv-muted)">Start from a template or a blank canvas.</p>
				</div>
				<span class="rounded-full bg-(--pv-primary) px-4 py-1.5 text-sm font-medium text-(--pv-on-primary)">Get started</span>
			</div>

			<!-- Team -->
			<div :class="card" class="grid gap-4">
				<div>
					<p class="font-medium">Team members</p>
					<p class="text-sm text-(--pv-muted)">4 people have access to this project.</p>
				</div>
				<div class="flex items-center justify-between">
					<div class="flex -space-x-2">
						<span
							v-for="member in team"
							:key="member.initials"
							class="grid size-9 place-items-center rounded-full text-xs font-semibold ring-2 ring-(--pv-surface)"
							:style="{ background: `var(--pv-${member.tone})`, color: `var(--pv-on-${member.tone})` }"
						>{{ member.initials }}</span>
					</div>
					<span class="inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-sm font-medium ring-1 ring-(--pv-border) ring-inset">
						<Icon name="lucide:user-plus" class="size-4" /> Invite
					</span>
				</div>
			</div>
		</div>
	</div>
</template>
