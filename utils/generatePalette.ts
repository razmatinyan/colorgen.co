export const generatePalette = (baseColor: string, scheme: string, numColors: number = 5) => {
    const { $chroma } = useNuxtApp();
    const color = $chroma(baseColor);
    
    let colors;
    switch(scheme) {
        case "monochromatic":
            colors = $chroma.scale([color.darken(2), color, color.brighten(2)]).colors(numColors);
            break;
        case "monoLight": 
            colors = $chroma.scale(['white', color.hex()]).mode('lab').colors(numColors);
            break;
        case "monoDark": 
            colors = $chroma.scale(['black', color.hex()]).mode('lab').colors(numColors);
            break;
        case "analogous":
            colors = $chroma.scale([color.set('hsl.h', '+20'), color, color.set('hsl.h', '-20')]).colors(numColors);
            break;
        case "complementary":
            colors = $chroma.scale([color, color.set('hsl.h', '+180')]).colors(numColors);
            break;
        case "split_complementary":
            colors = $chroma.scale([color, color.set('hsl.h', '+180')]).mode('lab').colors(numColors);
            break;
        case "triadic":
            colors = $chroma.scale([color, color.set('hsl.h', '+120'), color.set('hsl.h', '-120')]).colors(numColors);
            break;
        case "tetradic":
            colors = $chroma.scale([color, color.set('hsl.h', '+90'), color.set('hsl.h', '+180'), color.set('hsl.h', '-90')]).colors(numColors);
            break;
        case 'square':
            colors = $chroma.scale([color, color.set('hsl.h', '+90'), color.set('hsl.h', '+180'), color.set('hsl.h', '+270')]).colors(numColors);
            break;
        case "custom-1":
            colors = $chroma.scale([color.darken(1), color, color.brighten(2)]).colors(numColors);
            break;
        case "custom-2":
            colors = $chroma.scale([color.darken(1), color, color.brighten(1)]).colors(numColors);
            break;
        case "custom-3":
            colors = $chroma.scale([color.darken(2), color, color.brighten(1)]).colors(numColors);
            break;
        default:
            throw new Error("Invalid color scheme.");
    }
    
    return colors.map(c => $chroma(c).hex());
}