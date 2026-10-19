export function useModifierKey() {
	const isMac = ref(false)
	onMounted(() => {
		isMac.value = /Mac|iPhone|iPad/.test(navigator.userAgent)
	})
	return computed(() => (isMac.value ? '⌘' : 'Ctrl'))
}
