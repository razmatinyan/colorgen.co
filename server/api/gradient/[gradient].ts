import chroma from 'chroma-js'

export default defineEventHandler((event) => {
    const gradient: any = event.context.params?.gradient
    let gradientValidate: any;

    try {
        gradientValidate = gradient.split('-').map((c: string) => '#' + c);
    } catch (e) {
        gradientValidate = gradient.map((c: string) => '#' + c);
    }

    let filtered;
    if ( gradientValidate.length > 3 ) filtered = gradientValidate.slice(0, -1);
    else if ( gradientValidate.length == 1 ) {
        gradientValidate.push(chroma.random().hex());

        navigateTo(``)
    }
    
    let final = filtered.map((c: string) => c.substring(1)).join('-');

    return final
})