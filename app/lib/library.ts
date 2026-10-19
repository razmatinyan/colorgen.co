export const libraryVersion = 2
export const maxRecents = 8
export const maxSaved = 200

export const recentKinds = ['builder', 'palette', 'scale', 'contrast', 'convert', 'gradient'] as const
export type RecentKind = (typeof recentKinds)[number]

export interface RecentItem {
	id: string
	kind: RecentKind
	path: string
	title: string
	colors: string[]
	visitedAt: number
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
	return hasItemFields(value, 'visitedAt')
}

export function isSavedItem(value: unknown): value is SavedItem {
	return hasItemFields(value, 'savedAt')
}

export function migrateLibrary(data: unknown): LibraryData {
	if (!isRecord(data) || !Array.isArray(data.recents)) return emptyLibrary()
	if (data.version !== 1 && data.version !== libraryVersion) return emptyLibrary()
	const saved = data.version === libraryVersion && Array.isArray(data.saved) ? data.saved : []
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
	const others = library.recents.filter((item) => item.id !== entry.id && item.path !== entry.path)
	return { ...library, recents: [entry, ...others].slice(0, maxRecents) }
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
