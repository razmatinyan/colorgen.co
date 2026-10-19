<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { highlightCode, type CodeLanguage } from '~/lib/highlight'
import { cn } from '~/lib/utils'

const props = defineProps<{
	code: string
	language: CodeLanguage
	label: string
	wrap?: boolean
	class?: HTMLAttributes['class']
}>()

const lines = computed(() => highlightCode(props.code.trimEnd(), props.language))
</script>

<template>
	<pre
		tabindex="0"
		:aria-label="label"
		:class="
			cn(
				'font-sans text-sm/relaxed tabular-nums outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset',
				wrap && 'wrap-break-word whitespace-pre-wrap',
				props.class,
			)
		"
	><code class="block"><span v-for="(line, index) in lines" :key="index" class="block"><CodeLine :tokens="line" /></span></code></pre>
</template>
