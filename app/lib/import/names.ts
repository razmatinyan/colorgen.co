const namespaces = new Set([
	'color',
	'colors',
	'theme',
	'semantic',
	'sys',
	'ref',
	'palette',
	'primitive',
	'primitives',
	'tw',
	'tokens',
	'global',
	'core',
])

export function toImportName(source: string) {
	return source
		.replace(/^-+/, '')
		.replace(/([a-z0-9])([A-Z])/g, '$1-$2')
		.replace(/[\s_./]+/g, '-')
		.replace(/-+/g, '-')
		.replace(/^-|-$/g, '')
		.toLowerCase()
}

export function stripNamespaces(name: string) {
	let parts = name.split('-')
	while (parts.length > 1 && namespaces.has(parts[0]!)) parts = parts.slice(1)
	return parts.join('-')
}

export function looksLikeColorName(name: string) {
	return /(?:^|-)colou?rs?(?:-|$)/.test(name)
}
