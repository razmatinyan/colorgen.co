import { describe, expect, it } from 'vitest'
import { describeColor } from './names'

describe('describeColor', () => {
	it.each([
		['#ff0000', 'Red'],
		['#ffa500', 'Orange'],
		['#ffff00', 'Yellow'],
		['#00ff00', 'Green'],
		['#008080', 'Teal'],
		['#0000ff', 'Blue'],
		['#800080', 'Purple'],
		['#1f6cb0', 'Blue'],
		['#f4e19c', 'Light yellow'],
		['#ffffff', 'White'],
		['#000000', 'Black'],
		['#808080', 'Gray'],
		['#d9d9d9', 'Light gray'],
		['#222933', 'Dark gray'],
		['#3b0a0a', 'Deep red'],
		['#7a8b7a', 'Muted green'],
	])('names %s "%s"', (input, name) => {
		expect(describeColor(input)).toBe(name)
	})
})
