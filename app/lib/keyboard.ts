const interactiveSelector = [
	'input',
	'textarea',
	'select',
	'button',
	'a',
	'[contenteditable="true"]',
	'[role="combobox"]',
	'[role="slider"]',
	'[role="menu"]',
	'[role="listbox"]',
	'[role="dialog"]',
].join(', ')

export function isInteractiveTarget(event: KeyboardEvent) {
	return event.target instanceof Element && !!event.target.closest(interactiveSelector)
}
