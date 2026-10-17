export function useFileDownload() {
	return (filename: string, content: string, type: string) => {
		if (!import.meta.client) return
		const url = URL.createObjectURL(new Blob([content], { type }))
		const link = document.createElement('a')
		link.href = url
		link.download = filename
		link.click()
		URL.revokeObjectURL(url)
	}
}
