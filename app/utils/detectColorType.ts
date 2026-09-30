export const detectColorType = (color: string) => {
    if (typeof color !== 'string') {
      return null; // Return null if the input is not a string
    }
  
    // Check if the color is in the HEX format
    if (/^#([0-9A-Fa-f]{3}){1,2}$/.test(color)) {
      return 'hex';
    }
  
    // Check if the color is in the RGB format
    if (/^rgb\((\s*\d{1,3}\s*),(\s*\d{1,3}\s*),(\s*\d{1,3}\s*)\)$/.test(color)) {
      return 'rgb';
    }

    // Check if the color is in the RGBA format
    if ( /^rgba?\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})(,\s*([01]?(\.\d+)?))?\)$/i.test(color) ) {
        return 'rgba';
    }
  
    // Check if the color is in the HSL format
    if (/^hsl\((\s*\d{1,3}\s*),(\s*\d{1,3}%\s*),(\s*\d{1,3}%\s*)\)$/.test(color)) {
      return 'hsl';
    }
  
    return null; // Return null if the input is not a recognized color format
}