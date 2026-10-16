export type Rng = () => number

export function createRng(seed: number): Rng {
	let state = seed >>> 0
	return () => {
		state = (state + 0x6D2B79F5) >>> 0
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
