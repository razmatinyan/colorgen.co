export const generatePalette = (baseColor: string, scheme: string, numColors: number = 5) => {
    const { $chroma } = useNuxtApp();
    const color = $chroma(baseColor);
    
    let colors;
    switch(scheme) {
        case "monochromatic":
            colors = $chroma.scale([color.darken(2), color, color.brighten(2)]).colors(numColors);
            break;
        case "analogous":
            colors = $chroma.scale([color.set('hsl.h', '+20'), color, color.set('hsl.h', '-20')]).colors(numColors);
            break;
        case "complementary":
            colors = $chroma.scale([color, color.set('hsl.h', '+180')]).colors(numColors);
            break;
        case "triadic":
            colors = $chroma.scale([color, color.set('hsl.h', '+120'), color.set('hsl.h', '-120')]).colors(numColors);
            break;
        case "tetradic":
            colors = $chroma.scale([color, color.set('hsl.h', '+90'), color.set('hsl.h', '+180'), color.set('hsl.h', '-90')]).colors(numColors);
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
        case "custom-4":
            colors = $chroma.scale([color.darken(), color, color.brighten(2)]).colors(numColors);
            break;
        case "custom-5":
            colors = $chroma.scale([color.darken(), color, color.brighten(1)]).colors(numColors);
            break;
        case "custom-6":
            colors = $chroma.scale([color.darken(), color, color.brighten()]).colors(numColors);
            break;
        case "custom-7":
            colors = $chroma.scale([color.darken(2), color, color.brighten()]).colors(numColors);
            break;
        case "custom-8":
            colors = $chroma.scale([color.darken(1), color, color.brighten()]).colors(numColors);
            break;
        case "custom-9":
            colors = $chroma.scale([color, color.brighten()]).gamma(Math.floor(Math.random() * (2 - 0.5 + 1) + 0.5)).colors(numColors);
            break;
        case "custom-10":
            colors = $chroma.scale([color, color.brighten()]).padding([0.2, 0.7]).colors(numColors);
            break;
        default:
            throw new Error("Invalid color scheme.");
    }
    
    return colors.map(c => $chroma(c).hex());
}