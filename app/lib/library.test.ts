import { describe, expect, it } from 'vitest'
import { clearRecents, emptyLibrary, findSaved, isRecentItem, isSavedItem, maxRecents, maxSaved, migrateLibrary, parseLibrary, removeSaved, saveItem, upsertRecent, type RecentItem, type SavedItem } from './library'

const recent = (overrides: Partial<RecentItem> = {}): RecentItem => ({
	id: 'a',
	kind: 'builder',
	path: '/builder/1f6cb0',
	title: 'Blue system',
	colors: ['#1f6cb0', '#6e747b'],
	visitedAt: 1,
	...overrides,
})

const saved = (overrides: Partial<SavedItem> = {}): SavedItem => ({
	id: 's1',
	kind: 'palette',
	path: '/palette/1f6cb0-facc15',
	title: 'Blue palette',
	colors: ['#1f6cb0', '#facc15'],
	savedAt: 1,
	...overrides,
})

describe('parseLibrary', () => {
	it.each([null, '', 'not json', '[]', '42', '{"version":3,"recents":[]}', '{"version":1}'])('falls back to an empty library for %j', (raw) => {
		expect(parseLibrary(raw)).toEqual(emptyLibrary())
	})

	it('reads a stored library', () => {
		const stored = { version: 2, recents: [recent()], saved: [saved()] }
		expect(parseLibrary(JSON.stringify(stored))).toEqual(stored)
	})

	it('migrates a version 1 library with an empty saved list', () => {
		expect(parseLibrary(JSON.stringify({ version: 1, recents: [recent()] }))).toEqual({ version: 2, recents: [recent()], saved: [] })
	})
})

describe('migrateLibrary', () => {
	it('drops malformed recents and keeps valid ones', () => {
		const library = migrateLibrary({
			version: 1,
			recents: [
				recent(),
				recent({ id: 'b', path: '//evil.example' }),
				recent({ id: 'c', kind: 'mesh' as RecentItem['kind'] }),
				recent({ id: 'd', colors: ['red'] }),
				{ id: 'e' },
				null,
			],
		})
		expect(library.recents.map(item => item.id)).toEqual(['a'])
	})

	it('caps the number of recents', () => {
		const recents = Array.from({ length: maxRecents + 3 }, (_, index) => recent({ id: String(index), path: `/builder/${index}` }))
		expect(migrateLibrary({ version: 1, recents }).recents).toHaveLength(maxRecents)
	})
})

describe('isRecentItem', () => {
	it('accepts a valid entry', () => {
		expect(isRecentItem(recent())).toBe(true)
	})

	it.each([
		['an external path', { path: 'https://example.com' }],
		['a protocol-relative path', { path: '//example.com' }],
		['a non-finite timestamp', { visitedAt: Number.NaN }],
		['short hex colors', { colors: ['#fff'] }],
	])('rejects %s', (_, overrides) => {
		expect(isRecentItem(recent(overrides as Partial<RecentItem>))).toBe(false)
	})
})

describe('upsertRecent', () => {
	it('puts the newest entry first', () => {
		const library = upsertRecent(upsertRecent(emptyLibrary(), recent()), recent({ id: 'b', path: '/palette/111111' }))
		expect(library.recents.map(item => item.id)).toEqual(['b', 'a'])
	})

	it('updates an entry with the same id instead of adding one', () => {
		const library = upsertRecent(upsertRecent(emptyLibrary(), recent()), recent({ path: '/builder/e11d48', visitedAt: 2 }))
		expect(library.recents).toHaveLength(1)
		expect(library.recents[0]!.path).toBe('/builder/e11d48')
	})

	it('replaces an older entry with the same path', () => {
		const library = upsertRecent(upsertRecent(emptyLibrary(), recent()), recent({ id: 'b' }))
		expect(library.recents.map(item => item.id)).toEqual(['b'])
	})

	it('keeps at most the maximum number of entries', () => {
		let library = emptyLibrary()
		for (let index = 0; index < maxRecents + 2; index++) library = upsertRecent(library, recent({ id: String(index), path: `/builder/${index}` }))
		expect(library.recents).toHaveLength(maxRecents)
		expect(library.recents[0]!.id).toBe(String(maxRecents + 1))
	})
})

describe('clearRecents', () => {
	it('removes every recent', () => {
		expect(clearRecents(upsertRecent(emptyLibrary(), recent())).recents).toEqual([])
	})
})

describe('saved items', () => {
	it('validates entries and drops malformed ones on migration', () => {
		expect(isSavedItem(saved())).toBe(true)
		expect(isSavedItem(saved({ path: 'https://example.com' }))).toBe(false)
		expect(isSavedItem(recent())).toBe(false)
		const library = migrateLibrary({ version: 2, recents: [], saved: [saved(), saved({ id: 'bad', colors: ['blue'] }), null] })
		expect(library.saved.map(item => item.id)).toEqual(['s1'])
	})

	it('saves newest first and replaces an entry with the same path', () => {
		let library = saveItem(emptyLibrary(), saved())
		library = saveItem(library, saved({ id: 's2', path: '/scale/1f6cb0' }))
		library = saveItem(library, saved({ id: 's3' }))
		expect(library.saved.map(item => item.id)).toEqual(['s3', 's2'])
	})

	it('caps the number of saved items', () => {
		let library = emptyLibrary()
		for (let index = 0; index < maxSaved + 5; index++) library = saveItem(library, saved({ id: String(index), path: `/convert/${index}` }))
		expect(library.saved).toHaveLength(maxSaved)
		expect(library.saved[0]!.id).toBe(String(maxSaved + 4))
	})

	it('finds and removes items', () => {
		const library = saveItem(emptyLibrary(), saved())
		expect(findSaved(library, '/palette/1f6cb0-facc15')!.id).toBe('s1')
		expect(findSaved(library, '/palette/000000-ffffff')).toBeNull()
		expect(removeSaved(library, 's1').saved).toEqual([])
		expect(clearRecents(library).saved).toHaveLength(1)
	})
})
