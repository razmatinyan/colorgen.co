<script setup lang="ts">
import type { HighlightedLine, HighlightKind } from '~/lib/highlight'

defineProps<{ tokens: HighlightedLine }>()

const kindClasses: Record<HighlightKind, string> = {
	plain: 'text-foreground',
	punctuation: 'text-muted-foreground',
	keyword: 'text-code-keyword',
	property: 'text-code-property',
	string: 'text-code-string',
	number: 'text-code-number',
	function: 'text-code-function',
}
</script>

<template>
	<span
		v-for="(token, index) in tokens"
		:key="index"
		:class="[kindClasses[token.kind], token.swatch && 'whitespace-nowrap']"
		><span
			v-if="token.swatch"
			aria-hidden="true"
			class="mr-1 inline-block size-[0.8em] rounded-[3px] align-[-0.05em] ring-1 ring-foreground/15 ring-inset"
			:style="{ background: token.swatch }"
		/>{{ token.text }}</span
	>
	<template v-if="!tokens.length">{{ ' ' }}</template>
</template>
