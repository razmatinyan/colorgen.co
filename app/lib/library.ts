export const libraryVersion = 1
export const maxRecents = 8

export const recentKinds = ['builder', 'palette', 'scale'] as const
export type RecentKind = typeof recentKinds[number]

export interface RecentItem {
	id: string
	kind: RecentKind
	path: string
	title: string
	colors: string[]
	visitedAt: number
}

export interface LibraryData {
	version: typeof libraryVersion
	recents: RecentItem[]
}

const hexColor = /^#[0-9a-f]{6}$/
const localPath = /^\/(?!\/)/

export function emptyLibrary(): LibraryData {
	return { version: libraryVersion, recents: [] }
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function isRecentItem(value: unknown): value is RecentItem {
	return isRecord(value)
		&& typeof value.id === 'string'
		&& (recentKinds as readonly unknown[]).includes(value.kind)
		&& typeof value.path === 'string' && localPath.test(value.path)
		&& typeof value.title === 'string'
		&& Array.isArray(value.colors) && value.colors.every(color => typeof color === 'string' && hexColor.test(color))
		&& typeof value.visitedAt === 'number' && Number.isFinite(value.visitedAt)
}

export function migrateLibrary(data: unknown): LibraryData {
	if (!isRecord(data) || data.version !== libraryVersion || !Array.isArray(data.recents)) return emptyLibrary()
	return { version: libraryVersion, recents: data.recents.filter(isRecentItem).slice(0, maxRecents) }
}

export function parseLibrary(raw: string | null): LibraryData {
	if (!raw) return emptyLibrary()
	try {
		return migrateLibrary(JSON.parse(raw))
	}
	catch {
		return emptyLibrary()
	}
}

export function upsertRecent(library: LibraryData, entry: RecentItem): LibraryData {
	const others = library.recents.filter(item => item.id !== entry.id && item.path !== entry.path)
	return { ...library, recents: [entry, ...others].slice(0, maxRecents) }
}

export function clearRecents(library: LibraryData): LibraryData {
	return { ...library, recents: [] }
}
