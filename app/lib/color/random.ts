export type Rng = () => number

export function createRng(seed: number): Rng {
	let state = seed >>> 0
	return () => {
		state = (state + 0x6d2b79f5) >>> 0
		let t = state
		t = Math.imul(t ^ (t >>> 15), t | 1)
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296
	}
}

export function randomSeed() {
	return Math.floor(Math.random() * 4294967296)
}

export function between(rng: Rng, min: number, max: number) {
	return min + rng() * (max - min)
}

export function pick<T>(rng: Rng, items: readonly T[]): T {
	return items[Math.floor(rng() * items.length)]!
}

export function shuffle<T>(rng: Rng, items: readonly T[]): T[] {
	const shuffled = [...items]
	for (let index = shuffled.length - 1; index > 0; index--) {
		const swapIndex = Math.floor(rng() * (index + 1))
		const current = shuffled[index]!
		shuffled[index] = shuffled[swapIndex]!
		shuffled[swapIndex] = current
	}
	return shuffled
}
