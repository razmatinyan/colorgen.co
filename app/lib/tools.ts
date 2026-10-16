export interface ToolLink {
	id: string
	label: string
	description: string
	to: string
	icon: string
	status: 'live' | 'planned'
}

export const tools: ToolLink[] = [
	{ id: 'builder', label: 'Builder', description: 'A full UI color system from your brand color', to: '/builder', icon: 'lucide:blocks', status: 'live' },
	{ id: 'palette', label: 'Palette', description: 'Generate harmonious palettes in OKLCH', to: '/palette', icon: 'lucide:swatch-book', status: 'live' },
	{ id: 'scale', label: 'Scale', description: '50–950 shade scales for any color', to: '/scale', icon: 'lucide:chart-column', status: 'planned' },
	{ id: 'contrast', label: 'Contrast', description: 'WCAG 2.2 and APCA checks with fixes', to: '/contrast', icon: 'lucide:contrast', status: 'planned' },
	{ id: 'gradient', label: 'Gradient', description: 'Smooth multi-stop gradients', to: '/gradient', icon: 'lucide:blend', status: 'live' },
	{ id: 'image', label: 'Image', description: 'Extract colors from a photo', to: '/image-colors', icon: 'lucide:image', status: 'live' },
]
