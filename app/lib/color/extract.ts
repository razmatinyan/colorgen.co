import { converter } from 'culori'
import { toGamutOklch, toHex } from './format'
import { normalize } from './parse'
import { createRng, type Rng } from './random'
import type { Oklch } from './types'

export interface ExtractedColor {
	color: Oklch
	hex: string
	share: number
}

export interface ExtractOptions {
	count?: number
	rng?: Rng
	maxSamples?: number
	iterations?: number
}

export const minExtractCount = 3
export const maxExtractCount = 10
export const defaultExtractCount = 6

type Lab = [number, number, number]

const minAlpha = 125
const mergeDistance = 0.045
const accentMinShare = 0.01
const accentMinChroma = 0.08
const brandMinChroma = 0.04
const toOklab = converter('oklab')
const toOklchColor = converter('oklch')

function distanceSquared(a: Lab, b: Lab) {
	return (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2
}

function samplePixels(pixels: ArrayLike<number>, maxSamples: number): Lab[] {
	const pixelCount = Math.floor(pixels.length / 4)
	const stride = Math.max(1, Math.ceil(pixelCount / maxSamples))
	const samples: Lab[] = []
	for (let index = 0; index < pixelCount; index += stride) {
		const offset = index * 4
		if (pixels[offset + 3]! < minAlpha) continue
		const { l, a, b } = toOklab({
			mode: 'rgb',
			r: pixels[offset]! / 255,
			g: pixels[offset + 1]! / 255,
			b: pixels[offset + 2]! / 255,
		})
		samples.push([l, a, b])
	}
	return samples
}

function initialCenters(samples: Lab[], k: number, rng: Rng): Lab[] {
	const centers: Lab[] = [samples[Math.floor(rng() * samples.length)]!]
	const nearest = samples.map((sample) => distanceSquared(sample, centers[0]!))
	while (centers.length < k) {
		const total = nearest.reduce((sum, value) => sum + value, 0)
		if (total === 0) break
		let target = rng() * total
		let chosen = 0
		for (; chosen < samples.length - 1; chosen++) {
			target -= nearest[chosen]!
			if (target <= 0) break
		}
		const center = samples[chosen]!
		centers.push(center)
		samples.forEach((sample, index) => {
			nearest[index] = Math.min(nearest[index]!, distanceSquared(sample, center))
		})
	}
	return centers
}

interface Cluster {
	center: Lab
	size: number
}

function kMeans(samples: Lab[], k: number, rng: Rng, iterations: number): Cluster[] {
	let centers = initialCenters(samples, k, rng)
	const assignment = new Array<number>(samples.length).fill(-1)
	for (let iteration = 0; iteration < iterations; iteration++) {
		let changed = false
		samples.forEach((sample, index) => {
			let best = 0
			let bestDistance = Infinity
			centers.forEach((center, centerIndex) => {
				const distance = distanceSquared(sample, center)
				if (distance < bestDistance) {
					bestDistance = distance
					best = centerIndex
				}
			})
			if (assignment[index] !== best) {
				assignment[index] = best
				changed = true
			}
		})
		const sums = centers.map(() => [0, 0, 0, 0])
		samples.forEach((sample, index) => {
			const sum = sums[assignment[index]!]!
			sum[0]! += sample[0]
			sum[1]! += sample[1]
			sum[2]! += sample[2]
			sum[3]! += 1
		})
		centers = sums.map((sum, index) =>
			sum[3]! > 0 ? [sum[0]! / sum[3]!, sum[1]! / sum[3]!, sum[2]! / sum[3]!] : centers[index]!,
		)
		if (!changed) break
	}
	const sizes = centers.map(() => 0)
	assignment.forEach((index) => sizes[index]!++)
	return centers.map((center, index) => ({ center, size: sizes[index]! })).filter((cluster) => cluster.size > 0)
}

function mergeClose(clusters: Cluster[]): Cluster[] {
	const merged: Cluster[] = []
	for (const cluster of [...clusters].sort((a, b) => b.size - a.size)) {
		const target = merged.find((existing) => distanceSquared(existing.center, cluster.center) < mergeDistance ** 2)
		if (!target) {
			merged.push({ center: [...cluster.center], size: cluster.size })
			continue
		}
		const total = target.size + cluster.size
		target.center = target.center.map(
			(value, index) => (value * target.size + cluster.center[index]! * cluster.size) / total,
		) as Lab
		target.size = total
	}
	return merged
}

function toExtracted({ center, size }: Cluster, total: number): ExtractedColor {
	const { l, c, h } = toOklchColor({ mode: 'oklab', l: center[0], a: center[1], b: center[2] })
	const color = normalize(toGamutOklch({ l, c: c ?? 0, h: h ?? 0 }))
	return { color, hex: toHex(color), share: size / total }
}

export function extractColors(pixels: ArrayLike<number>, options: ExtractOptions = {}): ExtractedColor[] {
	const count = Math.min(maxExtractCount, Math.max(1, Math.round(options.count ?? defaultExtractCount)))
	const samples = samplePixels(pixels, options.maxSamples ?? 12000)
	if (samples.length === 0) return []
	const clusters = mergeClose(
		kMeans(samples, Math.min(samples.length, count * 2), options.rng ?? createRng(1), options.iterations ?? 16),
	)
	const colors = clusters.map((cluster) => toExtracted(cluster, samples.length))
	const picked = colors.slice(0, count)
	const accent = colors
		.slice(count)
		.filter((color) => color.share >= accentMinShare && color.color.c >= accentMinChroma)
		.sort((a, b) => b.color.c - a.color.c)[0]
	const mostColorful = Math.max(0, ...picked.map((color) => color.color.c))
	if (accent && accent.color.c > mostColorful && picked.length === count) picked[picked.length - 1] = accent
	const seen = new Set<string>()
	return picked
		.filter((color) => {
			if (seen.has(color.hex)) return false
			seen.add(color.hex)
			return true
		})
		.sort((a, b) => b.share - a.share)
}

export function suggestBrandColor(colors: readonly ExtractedColor[]): ExtractedColor | null {
	const score = ({ color, share }: ExtractedColor) =>
		color.c * Math.sqrt(share) * Math.max(0.2, 1 - Math.abs(color.l - 0.6) * 1.4)
	const candidates = colors.filter((color) => color.color.c >= brandMinChroma)
	if (candidates.length === 0) return null
	return candidates.reduce((best, color) => (score(color) > score(best) ? color : best))
}
