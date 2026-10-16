export function useCommandMenu() {
	const open = useState('command-menu-open', () => false)

	return {
		open,
		show: () => { open.value = true },
		toggle: () => { open.value = !open.value },
	}
}
