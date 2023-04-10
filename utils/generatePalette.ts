export const generatePalette = (baseColor: string, scheme: string, numColors: number = 5) => {
    const { $chroma } = useNuxtApp();
    const color = $chroma(baseColor);
    
    let colors;
    switch(scheme) {
        case "Monochromatic":
            colors = $chroma.scale([color.darken(2), color, color.brighten(2)]).colors(numColors);
            break;
        case "Mono Light": 
            colors = $chroma.scale(['white', color.hex()]).mode('lab').colors(numColors);
            break;
        case "Mono Dark": 
            colors = $chroma.scale(['black', color.hex()]).mode('lab').colors(numColors);
            break;
        case "Analogous":
            colors = $chroma.scale([color.set('hsl.h', '+20'), color, color.set('hsl.h', '-20')]).colors(numColors);
            break;
        case "Complementary":
            colors = $chroma.scale([color, color.set('hsl.h', '+180')]).colors(numColors);
            break;
        case "Split Complementary":
            colors = $chroma.scale([color, color.set('hsl.h', '+180')]).mode('lab').colors(numColors);
            break;
        case "Triadic":
            colors = $chroma.scale([color, color.set('hsl.h', '+120'), color.set('hsl.h', '-120')]).colors(numColors);
            break;
        case "Tetradic":
            colors = $chroma.scale([color, color.set('hsl.h', '+90'), color.set('hsl.h', '+180'), color.set('hsl.h', '-90')]).colors(numColors);
            break;
        case 'Square':
            colors = $chroma.scale([color, color.set('hsl.h', '+90'), color.set('hsl.h', '+180'), color.set('hsl.h', '+270')]).colors(numColors);
            break;
        default:
            throw new Error("Invalid color scheme.");
    }
    
    return colors.map(c => $chroma(c).hex());
}