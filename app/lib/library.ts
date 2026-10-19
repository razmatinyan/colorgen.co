export const libraryVersion = 3
export const maxRecents = 8
export const maxSaved = 200
export const maxTitleLength = 60

export const recentKinds = ['builder', 'palette', 'scale', 'contrast', 'convert', 'gradient'] as const
export type RecentKind = (typeof recentKinds)[number]

export interface RecentItem {
	id: string
	kind: RecentKind
	path: string
	title: string
	colors: string[]
	visitedAt: number
	customTitle?: string
}

export interface SavedItem {
	id: string
	kind: RecentKind
	path: string
	title: string
	colors: string[]
	savedAt: number
}

export interface LibraryData {
	version: typeof libraryVersion
	recents: RecentItem[]
	saved: SavedItem[]
}

const hexColor = /^#[0-9a-f]{6}$/
const localPath = /^\/(?!\/)/

export function emptyLibrary(): LibraryData {
	return { version: libraryVersion, recents: [], saved: [] }
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function hasItemFields(value: unknown, timeKey: 'visitedAt' | 'savedAt'): value is Record<string, unknown> {
	return (
		isRecord(value) &&
		typeof value.id === 'string' &&
		(recentKinds as readonly unknown[]).includes(value.kind) &&
		typeof value.path === 'string' &&
		localPath.test(value.path) &&
		typeof value.title === 'string' &&
		Array.isArray(value.colors) &&
		value.colors.every((color) => typeof color === 'string' && hexColor.test(color)) &&
		typeof value[timeKey] === 'number' &&
		Number.isFinite(value[timeKey])
	)
}

export function isRecentItem(value: unknown): value is RecentItem {
	return (
		hasItemFields(value, 'visitedAt') &&
		(value.customTitle === undefined ||
			(typeof value.customTitle === 'string' && value.customTitle.length <= maxTitleLength))
	)
}

export function isSavedItem(value: unknown): value is SavedItem {
	return hasItemFields(value, 'savedAt')
}

export function migrateLibrary(data: unknown): LibraryData {
	if (!isRecord(data) || !Array.isArray(data.recents)) return emptyLibrary()
	if (data.version !== 1 && data.version !== 2 && data.version !== libraryVersion) return emptyLibrary()
	const saved = data.version !== 1 && Array.isArray(data.saved) ? data.saved : []
	return {
		version: libraryVersion,
		recents: data.recents.filter(isRecentItem).slice(0, maxRecents),
		saved: saved.filter(isSavedItem).slice(0, maxSaved),
	}
}

export function parseLibrary(raw: string | null): LibraryData {
	if (!raw) return emptyLibrary()
	try {
		return migrateLibrary(JSON.parse(raw))
	} catch {
		return emptyLibrary()
	}
}

export function upsertRecent(library: LibraryData, entry: RecentItem): LibraryData {
	const replaced = library.recents.filter((item) => item.id === entry.id || item.path === entry.path)
	const others = library.recents.filter((item) => !replaced.includes(item))
	const customTitle = entry.customTitle ?? replaced.find((item) => item.customTitle)?.customTitle
	const next = customTitle ? { ...entry, customTitle } : entry
	return { ...library, recents: [next, ...others].slice(0, maxRecents) }
}

export function recentTitle(item: Pick<RecentItem, 'title' | 'customTitle'>) {
	return item.customTitle ?? item.title
}

export function removeRecent(library: LibraryData, id: string): LibraryData {
	return { ...library, recents: library.recents.filter((item) => item.id !== id) }
}

export function restoreRecent(library: LibraryData, entry: RecentItem, index: number): LibraryData {
	const others = library.recents.filter((item) => item.id !== entry.id && item.path !== entry.path)
	const position = Math.min(Math.max(0, index), others.length)
	return {
		...library,
		recents: [...others.slice(0, position), entry, ...others.slice(position)].slice(0, maxRecents),
	}
}

export function renameRecent(library: LibraryData, id: string, title: string): LibraryData {
	const customTitle = title.trim().slice(0, maxTitleLength)
	return {
		...library,
		recents: library.recents.map((item) => {
			if (item.id !== id) return item
			const { customTitle: _previous, ...rest } = item
			return customTitle && customTitle !== item.title ? { ...rest, customTitle } : rest
		}),
	}
}

export function clearRecents(library: LibraryData): LibraryData {
	return { ...library, recents: [] }
}

export function saveItem(library: LibraryData, entry: SavedItem): LibraryData {
	const others = library.saved.filter((item) => item.id !== entry.id && item.path !== entry.path)
	return { ...library, saved: [entry, ...others].slice(0, maxSaved) }
}

export function removeSaved(library: LibraryData, id: string): LibraryData {
	return { ...library, saved: library.saved.filter((item) => item.id !== id) }
}

export function findSaved(library: LibraryData, path: string) {
	return library.saved.find((item) => item.path === path) ?? null
}
