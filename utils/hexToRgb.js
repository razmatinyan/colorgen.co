export const hexToRgb = (hex) => {
    if ( hex.charAt(0) === '#' ) {
        hex = hex.substring(1);
    }

    // Convert the HEX color to RGB
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    // Return the RGB value
    return `rgb(${r}, ${g}, ${b})`;
}