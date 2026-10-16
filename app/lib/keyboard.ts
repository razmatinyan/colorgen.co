const interactiveSelector = 'input, textarea, select, button, a, [role="combobox"], [contenteditable="true"]'

export function isInteractiveTarget(event: KeyboardEvent) {
	return event.target instanceof Element && !!event.target.closest(interactiveSelector)
}
