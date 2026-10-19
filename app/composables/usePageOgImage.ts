import { buildOgImage, type OgImageProps } from '~/lib/og-image'

export function usePageOgImage(props: OgImageProps) {
	if (!import.meta.server) return
	const { label, title } = buildOgImage(props)
	defineOgImage('Sygen', { ...props }, { alt: `${label}: ${title}` })
}
