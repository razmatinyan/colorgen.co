import type { MaybeRefOrGetter } from 'vue'

export function useCanonicalUrl(path: MaybeRefOrGetter<string>) {
	const site = useSiteConfig()
	const url = computed(() => `${site.url.replace(/\/$/, '')}${toValue(path)}`)

	useSeoMeta({ ogUrl: url })
	useHead({ link: [{ rel: 'canonical', href: url }] })

	return url
}
