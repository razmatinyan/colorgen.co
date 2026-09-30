import chroma from 'chroma-js'

export default defineEventHandler((event) => {
	const gradient = event.context.params?.gradient ?? ''
	let gradientArray: string[] = []

	try {

		gradientArray = gradient
							.split('-')
							.map((c: string) => (c === '' || chroma.valid(`#${c}`) === false ) ? '' : c);

		return gradientArray[0] !== '' ? gradientArray : false;

	} catch (e) {

		if ( chroma.valid(`#${gradient}`) === true ) {

			gradientArray.push(gradient);
			gradientArray.push('');

			return gradientArray;

		} else {
			return false;
		}

	}
})
