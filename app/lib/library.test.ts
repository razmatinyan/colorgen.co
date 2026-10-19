import { describe, expect, it } from 'vitest'
import {
	clearRecents,
	emptyLibrary,
	findSaved,
	isRecentItem,
	isSavedItem,
	maxRecents,
	maxSaved,
	maxTitleLength,
	migrateLibrary,
	parseLibrary,
	recentTitle,
	removeRecent,
	removeSaved,
	renameRecent,
	restoreRecent,
	saveItem,
	upsertRecent,
	type RecentItem,
	type SavedItem,
} from './library'

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
	it.each([null, '', 'not json', '[]', '42', '{"version":4,"recents":[]}', '{"version":1}'])(
		'falls back to an empty library for %j',
		(raw) => {
			expect(parseLibrary(raw)).toEqual(emptyLibrary())
		},
	)

	it('reads a stored library', () => {
		const stored = { version: 3, recents: [recent({ customTitle: 'Marketing site' })], saved: [saved()] }
		expect(parseLibrary(JSON.stringify(stored))).toEqual(stored)
	})

	it('migrates a version 1 library with an empty saved list', () => {
		expect(parseLibrary(JSON.stringify({ version: 1, recents: [recent()] }))).toEqual({
			version: 3,
			recents: [recent()],
			saved: [],
		})
	})

	it('migrates a version 2 library unchanged', () => {
		const stored = { version: 2, recents: [recent()], saved: [saved()] }
		expect(parseLibrary(JSON.stringify(stored))).toEqual({ ...stored, version: 3 })
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
		expect(library.recents.map((item) => item.id)).toEqual(['a'])
	})

	it('caps the number of recents', () => {
		const recents = Array.from({ length: maxRecents + 3 }, (_, index) =>
			recent({ id: String(index), path: `/builder/${index}` }),
		)
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
		['a non-string custom title', { customTitle: 42 }],
		['a custom title that is too long', { customTitle: 'x'.repeat(maxTitleLength + 1) }],
	])('rejects %s', (_, overrides) => {
		expect(isRecentItem(recent(overrides as Partial<RecentItem>))).toBe(false)
	})
})

describe('upsertRecent', () => {
	it('puts the newest entry first', () => {
		const library = upsertRecent(upsertRecent(emptyLibrary(), recent()), recent({ id: 'b', path: '/palette/111111' }))
		expect(library.recents.map((item) => item.id)).toEqual(['b', 'a'])
	})

	it('updates an entry with the same id instead of adding one', () => {
		const library = upsertRecent(
			upsertRecent(emptyLibrary(), recent()),
			recent({ path: '/builder/e11d48', visitedAt: 2 }),
		)
		expect(library.recents).toHaveLength(1)
		expect(library.recents[0]!.path).toBe('/builder/e11d48')
	})

	it('replaces an older entry with the same path', () => {
		const library = upsertRecent(upsertRecent(emptyLibrary(), recent()), recent({ id: 'b' }))
		expect(library.recents.map((item) => item.id)).toEqual(['b'])
	})

	it('keeps at most the maximum number of entries', () => {
		let library = emptyLibrary()
		for (let index = 0; index < maxRecents + 2; index++)
			library = upsertRecent(library, recent({ id: String(index), path: `/builder/${index}` }))
		expect(library.recents).toHaveLength(maxRecents)
		expect(library.recents[0]!.id).toBe(String(maxRecents + 1))
	})
})

describe('custom titles', () => {
	it('keeps a custom title while the visit updates its path and automatic title', () => {
		let library = renameRecent(upsertRecent(emptyLibrary(), recent()), 'a', '  Marketing site  ')
		library = upsertRecent(library, recent({ path: '/builder/e11d48', title: 'Red system', visitedAt: 2 }))
		expect(library.recents[0]!.customTitle).toBe('Marketing site')
		expect(recentTitle(library.recents[0]!)).toBe('Marketing site')
	})

	it('carries a custom title over to a new visit of the same path', () => {
		const library = renameRecent(upsertRecent(emptyLibrary(), recent()), 'a', 'Marketing site')
		expect(upsertRecent(library, recent({ id: 'b' })).recents[0]).toMatchObject({
			id: 'b',
			customTitle: 'Marketing site',
		})
	})

	it('drops the custom title when it is cleared or matches the automatic one', () => {
		let library = renameRecent(upsertRecent(emptyLibrary(), recent()), 'a', 'Marketing site')
		library = renameRecent(library, 'a', '   ')
		expect(library.recents[0]).toEqual(recent())
		expect(renameRecent(library, 'a', 'Blue system').recents[0]).toEqual(recent())
		expect(recentTitle(recent())).toBe('Blue system')
	})

	it('trims and caps a custom title', () => {
		const library = renameRecent(upsertRecent(emptyLibrary(), recent()), 'a', 'x'.repeat(100))
		expect(library.recents[0]!.customTitle).toHaveLength(maxTitleLength)
	})
})

describe('removeRecent and restoreRecent', () => {
	const three = [
		recent({ id: 'a', path: '/builder/aaaaaa' }),
		recent({ id: 'b', path: '/builder/bbbbbb' }),
		recent({ id: 'c', path: '/builder/cccccc' }),
	]
	const library = { ...emptyLibrary(), recents: three }

	it('removes only the given entry', () => {
		expect(removeRecent(library, 'b').recents.map((item) => item.id)).toEqual(['a', 'c'])
	})

	it('puts a removed entry back where it was', () => {
		const removed = removeRecent(library, 'b')
		expect(restoreRecent(removed, three[1]!, 1).recents.map((item) => item.id)).toEqual(['a', 'b', 'c'])
		expect(restoreRecent(removed, three[1]!, 99).recents.map((item) => item.id)).toEqual(['a', 'c', 'b'])
	})

	it('does not duplicate an entry that came back in the meantime', () => {
		const revisited = upsertRecent(removeRecent(library, 'b'), recent({ id: 'd', path: '/builder/bbbbbb' }))
		expect(restoreRecent(revisited, three[1]!, 1).recents.map((item) => item.id)).toEqual(['a', 'b', 'c'])
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
		const library = migrateLibrary({
			version: 2,
			recents: [],
			saved: [saved(), saved({ id: 'bad', colors: ['blue'] }), null],
		})
		expect(library.saved.map((item) => item.id)).toEqual(['s1'])
	})

	it('saves newest first and replaces an entry with the same path', () => {
		let library = saveItem(emptyLibrary(), saved())
		library = saveItem(library, saved({ id: 's2', path: '/scale/1f6cb0' }))
		library = saveItem(library, saved({ id: 's3' }))
		expect(library.saved.map((item) => item.id)).toEqual(['s3', 's2'])
	})

	it('caps the number of saved items', () => {
		let library = emptyLibrary()
		for (let index = 0; index < maxSaved + 5; index++)
			library = saveItem(library, saved({ id: String(index), path: `/convert/${index}` }))
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
