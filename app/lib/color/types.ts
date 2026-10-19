export interface Oklch {
	l: number
	c: number
	h: number
}

export type ColorInput = Oklch | string

export type ColorFormat = 'hex' | 'rgb' | 'hsl' | 'oklch'
