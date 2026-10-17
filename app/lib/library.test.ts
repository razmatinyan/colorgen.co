import { describe, expect, it } from 'vitest'
import { clearRecents, emptyLibrary, isRecentItem, maxRecents, migrateLibrary, parseLibrary, upsertRecent, type RecentItem } from './library'

const recent = (overrides: Partial<RecentItem> = {}): RecentItem => ({
	id: 'a',
	kind: 'builder',
	path: '/builder/1f6cb0',
	title: 'Blue system',
	colors: ['#1f6cb0', '#6e747b'],
	visitedAt: 1,
	...overrides,
})

describe('parseLibrary', () => {
	it.each([null, '', 'not json', '[]', '42', '{"version":2,"recents":[]}', '{"version":1}'])('falls back to an empty library for %j', (raw) => {
		expect(parseLibrary(raw)).toEqual(emptyLibrary())
	})

	it('reads a stored library', () => {
		const stored = { version: 1, recents: [recent()] }
		expect(parseLibrary(JSON.stringify(stored))).toEqual(stored)
	})
})

describe('migrateLibrary', () => {
	it('drops malformed recents and keeps valid ones', () => {
		const library = migrateLibrary({
			version: 1,
			recents: [
				recent(),
				recent({ id: 'b', path: '//evil.example' }),
				recent({ id: 'c', kind: 'gradient' as RecentItem['kind'] }),
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
