export const useWindowSizes = () => useState<object>('windowSizes', () => {
	const width: number = window.innerWidth;
	const height: number = window.innerHeight;

	return {
		width,
		height
	}
});