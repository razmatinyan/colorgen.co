export const generatePalette = (baseColor: string, scheme: string, numColors: number = 5) => {
    const { $chroma } = useNuxtApp();
    const color = $chroma(baseColor);
    
    let colors;
    const colorArray = [];
    switch(scheme) {
        case "Random":
            colors = $chroma.scale([$chroma.random(), $chroma.random()]).mode('lch').colors(numColors);
            break;
        case "Monochromatic":
            colors = $chroma.scale([color.darken(2), color, color.brighten(2)]).colors(numColors);
            break;
        case "Mono Light": 
            colors = $chroma.scale(['#efefef', color.hex()]).mode('lab').colors(numColors);
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
        case 'Luminance':
            const minLuminance = 0.2;
            const maxLuminance = 0.8;

            const step = (maxLuminance - minLuminance) / (numColors - 1);
          
            for (let i = 0; i < numColors; i++) {
                const luminance = minLuminance + i * step;
                const newColor = $chroma(color).luminance(luminance);
                colorArray.push(newColor);
            }

            colors = colorArray;

            break;
        default:
            throw new Error("Invalid color scheme.");
    }
    
    return colors.map(c => $chroma(c).hex());
}