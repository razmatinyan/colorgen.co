/** Open state of the global ⌘K command menu, shared by the header trigger and the menu itself. */
export function useCommandMenu() {
	const open = useState('command-menu-open', () => false)

	return {
		open,
		show: () => { open.value = true },
		toggle: () => { open.value = !open.value },
	}
}
