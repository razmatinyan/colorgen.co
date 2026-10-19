<script setup lang="ts">
import { scaleSteps, statusKinds, type ScaleStep, type StatusKind, type TokenName } from '~/lib/color'
import { designSystemBuilderKey } from '~/composables/useDesignSystemBuilder'

const props = defineProps<{ mode: 'light' | 'dark' }>()
const builder = inject(designSystemBuilderKey)!

const tokens = computed(() => {
	const system = builder.system.value
	const resolved = builder.tokens.value
	const dark = props.mode === 'dark'
	const token = (name: TokenName) => resolved[name][props.mode].hex
	const step = (id: StatusKind, light: ScaleStep, darkStep: ScaleStep) =>
		system[id].swatches[scaleSteps.indexOf(dark ? darkStep : light)]!.hex

	const statusTokens = statusKinds.flatMap((kind) => {
		const name = kind === 'danger' ? 'destructive' : kind
		return [
			[`--pv-${kind}`, token(name)],
			[`--pv-on-${kind}`, token(`${name}-foreground`)],
			[`--pv-${kind}-text`, step(kind, 700, 300)],
			[`--pv-${kind}-soft`, step(kind, 50, 950)],
			[`--pv-${kind}-border`, step(kind, 200, 800)],
		]
	})

	return {
		'--pv-bg': token('background'),
		'--pv-surface': token('card'),
		'--pv-field': token('muted'),
		'--pv-text': token('foreground'),
		'--pv-muted': token('muted-foreground'),
		'--pv-border': token('border'),
		'--pv-input': token('input'),
		'--pv-ring': token('ring'),
		'--pv-primary': token('primary'),
		'--pv-on-primary': token('primary-foreground'),
		'--pv-secondary': token('secondary'),
		'--pv-on-secondary': token('secondary-foreground'),
		'--pv-sidebar': token('sidebar'),
		'--pv-sidebar-text': token('sidebar-foreground'),
		'--pv-sidebar-active': token('sidebar-accent'),
		'--pv-sidebar-active-text': token('sidebar-accent-foreground'),
		'--pv-sidebar-border': token('sidebar-border'),
		'--pv-bar-1': token('chart-1'),
		'--pv-bar-2': token('chart-2'),
		'--pv-bar-3': token('chart-3'),
		'--pv-bar-4': token('chart-4'),
		'--pv-bar-5': token('chart-5'),
		...Object.fromEntries(statusTokens),
	}
})

const card = 'mb-4 break-inside-avoid rounded-2xl bg-(--pv-surface) p-5 ring-1 ring-(--pv-border)'
const field = 'flex h-9 items-center rounded-full bg-(--pv-field) px-3.5 text-sm text-(--pv-muted)'
const pill = 'inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-sm font-medium'

const tinted = (kind: StatusKind) => ({ background: `var(--pv-${kind}-soft)`, color: `var(--pv-${kind}-text)` })
const solid = (kind: StatusKind) => ({ background: `var(--pv-${kind})`, color: `var(--pv-on-${kind})` })

const alerts: { kind: StatusKind; icon: string; title: string; text: string }[] = [
	{ kind: 'success', icon: 'lucide:circle-check', title: 'Payment received', text: 'Invoice #1042 was paid in full.' },
	{
		kind: 'warning',
		icon: 'lucide:triangle-alert',
		title: 'Your trial ends in 3 days',
		text: 'Add a payment method to keep your projects.',
	},
	{
		kind: 'danger',
		icon: 'lucide:circle-x',
		title: 'Couldn’t save changes',
		text: 'Check your connection and try again.',
	},
	{
		kind: 'info',
		icon: 'lucide:info',
		title: 'A new version is available',
		text: 'Reload the page to get the latest features.',
	},
]

const invoices: { id: string; client: string; amount: string; status: string; kind: StatusKind | null }[] = [
	{ id: 'INV-1042', client: 'Northwind', amount: '$4,200', status: 'Paid', kind: 'success' },
	{ id: 'INV-1041', client: 'Acme Corp', amount: '$1,860', status: 'Pending', kind: 'warning' },
	{ id: 'INV-1040', client: 'Globex', amount: '$920', status: 'Overdue', kind: 'danger' },
	{ id: 'INV-1039', client: 'Initech', amount: '$2,310', status: 'Draft', kind: null },
]

const bars = [
	{ month: 'Dec', height: 58, tone: '--pv-bar-1' },
	{ month: 'Jan', height: 92, tone: '--pv-bar-2' },
	{ month: 'Feb', height: 74, tone: '--pv-bar-3' },
	{ month: 'Mar', height: 100, tone: '--pv-bar-4' },
	{ month: 'Apr', height: 66, tone: '--pv-bar-5' },
]

const revenue = [52, 60, 48, 66, 58, 74, 62, 70, 56, 80, 72, 88]
const area = computed(() => {
	const stepWidth = 300 / (revenue.length - 1)
	const points = revenue.map((value, index) => `${(index * stepWidth).toFixed(1)},${(100 - value).toFixed(1)}`)
	return { line: `M${points.join(' L')}`, fill: `M0,100 L${points.join(' L')} L300,100 Z` }
})

const navItems = [
	{ label: 'Dashboard', icon: 'lucide:layout-dashboard' },
	{ label: 'Invoices', icon: 'lucide:receipt', active: true },
	{ label: 'Customers', icon: 'lucide:users' },
	{ label: 'Inbox', icon: 'lucide:inbox', count: 4 },
	{ label: 'Settings', icon: 'lucide:settings' },
]

const setupSteps = [
	{ label: 'Create your workspace', done: true },
	{ label: 'Invite your team', done: true },
	{ label: 'Connect a bank account', done: true },
	{ label: 'Send your first invoice', done: false },
]
</script>

<template>
	<div
		class="@container rounded-xl bg-(--pv-bg) p-4 text-(--pv-text) ring-1 ring-(--pv-border) transition-colors duration-200"
		:style="tokens"
	>
		<div class="columns-1 gap-4 @xl:columns-2 @4xl:columns-3">
			<div :class="card" class="grid gap-4">
				<div class="flex flex-wrap gap-2">
					<span :class="pill" class="bg-(--pv-primary) text-(--pv-on-primary)">Save changes</span>
					<span :class="pill" class="bg-(--pv-secondary) text-(--pv-on-secondary)">Preview</span>
					<span :class="pill" class="ring-1 ring-(--pv-border) ring-inset">Cancel</span>
					<span :class="pill" :style="solid('danger')"><Icon name="lucide:trash-2" class="size-4" /> Delete</span>
				</div>
				<div class="grid gap-1.5">
					<span class="text-sm font-medium">Workspace name</span>
					<span
						:class="field"
						class="text-(--pv-text) ring-1 ring-(--pv-ring)"
						:style="{ boxShadow: '0 0 0 4px color-mix(in oklch, var(--pv-ring) 30%, transparent)' }"
						>Studio North<span class="ml-px h-4 w-px bg-(--pv-text)"
					/></span>
				</div>
				<div class="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm whitespace-nowrap">
					<span class="flex items-center gap-2">
						<span class="grid size-4.5 place-items-center rounded-md bg-(--pv-primary) text-(--pv-on-primary)"
							><Icon name="lucide:check" class="size-3.5"
						/></span>
						Remember me
					</span>
					<span class="flex items-center gap-2">
						<span class="flex h-5 w-9 items-center justify-end rounded-full bg-(--pv-primary) p-0.5"
							><span class="size-4 rounded-full bg-(--pv-on-primary)"
						/></span>
						On
					</span>
					<span class="flex items-center gap-2">
						<span
							class="flex h-5 w-9 items-center rounded-full bg-(--pv-field) p-0.5 ring-1 ring-(--pv-border) ring-inset"
							><span class="size-4 rounded-full bg-(--pv-surface) ring-1 ring-(--pv-border)"
						/></span>
						Off
					</span>
				</div>
			</div>

			<div :class="card" class="grid gap-2.5">
				<div
					v-for="alert in alerts"
					:key="alert.kind"
					class="flex gap-3 rounded-xl border p-3"
					:style="{ ...tinted(alert.kind), borderColor: `var(--pv-${alert.kind}-border)` }"
				>
					<Icon :name="alert.icon" class="mt-0.5 size-4 shrink-0" />
					<div>
						<p class="text-sm font-medium">{{ alert.title }}</p>
						<p class="text-sm opacity-85">{{ alert.text }}</p>
					</div>
				</div>
			</div>

			<div :class="card" class="grid gap-4">
				<div>
					<p class="font-medium">Sign in</p>
					<p class="text-sm text-(--pv-muted)">Welcome back. Enter your details.</p>
				</div>
				<div class="grid gap-1.5">
					<span class="text-sm font-medium">Email</span>
					<span :class="field" class="text-(--pv-text)">ana@studio.co</span>
				</div>
				<div class="grid gap-1.5">
					<span class="flex justify-between text-sm font-medium">
						Password
						<span class="font-normal text-(--pv-primary)">Forgot password?</span>
					</span>
					<span :class="field" class="text-(--pv-text) ring-1 ring-(--pv-danger)">••••</span>
					<span class="flex items-center gap-1.5 text-sm text-(--pv-danger-text)">
						<Icon name="lucide:circle-alert" class="size-4" /> Use at least 8 characters.
					</span>
				</div>
				<span :class="pill" class="justify-center bg-(--pv-primary) text-(--pv-on-primary)">Sign in</span>
			</div>

			<div :class="card" class="grid gap-3 overflow-hidden pb-0">
				<div class="grid grid-cols-2 gap-3">
					<div>
						<p class="text-sm text-(--pv-muted)">Revenue</p>
						<p class="text-2xl font-semibold tracking-tight tabular-nums">$48,210</p>
						<span
							class="mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium tabular-nums"
							:style="tinted('success')"
						>
							<Icon name="lucide:trending-up" class="size-3.5" /> 12.4%
						</span>
					</div>
					<div>
						<p class="text-sm text-(--pv-muted)">Churn</p>
						<p class="text-2xl font-semibold tracking-tight tabular-nums">2.4%</p>
						<span
							class="mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium tabular-nums"
							:style="tinted('danger')"
						>
							<Icon name="lucide:trending-up" class="size-3.5" /> 0.6%
						</span>
					</div>
				</div>
				<svg
					viewBox="0 0 300 100"
					preserveAspectRatio="none"
					class="-mx-5 h-20 w-[calc(100%+2.5rem)]"
					aria-hidden="true"
				>
					<path :d="area.fill" fill="var(--pv-primary)" fill-opacity="0.16" />
					<path
						:d="area.line"
						fill="none"
						stroke="var(--pv-primary)"
						stroke-width="2"
						vector-effect="non-scaling-stroke"
					/>
				</svg>
			</div>

			<div :class="card" class="grid gap-3 p-3">
				<p class="px-2 pt-1 font-medium">Invoices</p>
				<div class="grid">
					<div
						v-for="invoice in invoices"
						:key="invoice.id"
						class="flex items-center gap-3 border-t border-(--pv-border) px-2 py-2.5 text-sm first:border-t-0"
					>
						<div class="min-w-0 flex-1">
							<p class="font-medium">{{ invoice.client }}</p>
							<p class="text-xs text-(--pv-muted) tabular-nums">{{ invoice.id }}</p>
						</div>
						<span class="tabular-nums">{{ invoice.amount }}</span>
						<span
							class="inline-flex w-20 items-center justify-center gap-1.5 rounded-full py-0.5 text-xs font-medium"
							:class="!invoice.kind && 'bg-(--pv-field) text-(--pv-muted)'"
							:style="invoice.kind ? tinted(invoice.kind) : undefined"
						>
							<span class="size-1.5 rounded-full bg-current" />{{ invoice.status }}
						</span>
					</div>
				</div>
			</div>

			<div :class="card" class="grid gap-4">
				<div>
					<p class="font-medium">Monthly volume</p>
					<p class="text-sm text-(--pv-muted)">Last 5 months</p>
				</div>
				<div class="flex h-32 items-end gap-3">
					<div v-for="bar in bars" :key="bar.month" class="flex h-full flex-1 flex-col justify-end gap-2">
						<span
							class="w-full rounded-xl transition-colors duration-300"
							:style="{ height: `${bar.height}%`, background: `var(${bar.tone})` }"
						/>
						<span class="text-center text-xs text-(--pv-muted)">{{ bar.month }}</span>
					</div>
				</div>
			</div>

			<div :class="card" class="grid gap-0.5 bg-(--pv-sidebar) p-3 text-(--pv-sidebar-text) ring-(--pv-sidebar-border)">
				<span
					v-for="item in navItems"
					:key="item.label"
					class="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm"
					:class="item.active && 'bg-(--pv-sidebar-active) font-medium text-(--pv-sidebar-active-text)'"
				>
					<Icon :name="item.icon" class="size-4" :class="!item.active && 'text-(--pv-muted)'" />
					{{ item.label }}
					<span v-if="item.count" class="ml-auto rounded-full px-1.5 text-xs font-semibold" :style="solid('danger')">{{
						item.count
					}}</span>
				</span>
			</div>

			<div :class="card" class="grid gap-2.5 bg-transparent p-0 ring-0">
				<div class="flex items-start gap-3 rounded-2xl bg-(--pv-surface) p-3.5 ring-1 ring-(--pv-border)">
					<Icon name="lucide:circle-check" class="mt-0.5 size-4 shrink-0 text-(--pv-success-text)" />
					<div class="flex-1">
						<p class="text-sm font-medium">Changes saved</p>
						<p class="text-sm text-(--pv-muted)">Your profile is up to date.</p>
					</div>
					<Icon name="lucide:x" class="size-4 text-(--pv-muted)" />
				</div>
				<div class="flex items-start gap-3 rounded-2xl bg-(--pv-surface) p-3.5 ring-1 ring-(--pv-border)">
					<Icon name="lucide:circle-x" class="mt-0.5 size-4 shrink-0 text-(--pv-danger-text)" />
					<div class="flex-1">
						<p class="text-sm font-medium">Upload failed</p>
						<p class="text-sm text-(--pv-muted)">report-q3.pdf is larger than 10 MB.</p>
					</div>
					<span class="text-sm font-medium text-(--pv-primary)">Retry</span>
				</div>
			</div>

			<div :class="card" class="grid gap-4">
				<div>
					<p class="font-medium">Set up your workspace</p>
					<p class="text-sm text-(--pv-muted)">3 of 4 steps done</p>
				</div>
				<div class="h-2 overflow-hidden rounded-full bg-(--pv-field)">
					<div class="h-full w-3/4 rounded-full bg-(--pv-primary)" />
				</div>
				<ul class="grid gap-2 text-sm">
					<li v-for="item in setupSteps" :key="item.label" class="flex items-center gap-2.5">
						<span
							class="grid size-5 shrink-0 place-items-center rounded-full"
							:class="!item.done && 'ring-1 ring-(--pv-border) ring-inset'"
							:style="item.done ? solid('success') : undefined"
						>
							<Icon v-if="item.done" name="lucide:check" class="size-3.5" />
						</span>
						<span :class="item.done && 'text-(--pv-muted) line-through'">{{ item.label }}</span>
					</li>
				</ul>
				<p class="flex gap-2 rounded-xl p-3 text-sm" :style="tinted('info')">
					<Icon name="lucide:lightbulb" class="mt-0.5 size-4 shrink-0" />
					Tip: invoices with a due date get paid twice as fast.
				</p>
			</div>

			<div :class="card" class="flex flex-col items-center gap-3 py-8 text-center">
				<span
					class="grid size-11 place-items-center rounded-full text-(--pv-primary)"
					:style="{ background: 'color-mix(in oklch, var(--pv-primary) 14%, var(--pv-surface))' }"
				>
					<Icon name="lucide:folder-plus" class="size-5" />
				</span>
				<div>
					<p class="font-medium">No projects yet</p>
					<p class="mx-auto max-w-56 text-sm text-(--pv-muted)">Create a project to start tracking your work.</p>
				</div>
				<span class="rounded-full bg-(--pv-primary) px-4 py-1.5 text-sm font-medium text-(--pv-on-primary)"
					>New project</span
				>
			</div>
		</div>
	</div>
</template>
